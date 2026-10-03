import express from "express";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 10, fileSize: 12 * 1024 * 1024 }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname,"public")));

const client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const SYSTEM_PROMPT = `
You are an institutional-style Indian equity research and portfolio-analysis engine.

The user uploads broker screenshots containing holdings. Extract and validate:
company/ticker, quantity, average buy price, current price, invested value, current value, P/L, P/L%, and portfolio weight.

Never invent data. Label every material item as REPORTED, MANAGEMENT GUIDANCE, EXTERNAL ESTIMATE, CALCULATED, or MODEL ASSUMPTION. Use primary sources first: annual reports, investor presentations, exchange filings, SEBI/regulatory orders, court records, official results and company con-call materials. For current/recent claims use web research and cite sources.

Analyse, as applicable:
- 3/5/10-year financial history
- Revenue/EBITDA/PAT/EPS CAGR
- ROE/ROCE/ROIC and incremental returns
- margins, cash conversion, FCF, working capital
- debt, net debt, interest coverage
- moat, competition, industry structure
- domestic/global market share
- TAM and industry growth
- major disclosed customers and geography
- capacity, utilisation, plants/units
- current and planned CAPEX
- CAPEX/CFO, CAPEX/EBITDA and CAPEX/revenue
- historical capex promises versus execution
- latest and requested historical con-calls
- management guidance versus actual delivery
- 5/10/25-year strategic vision where documented
- Viksit Bharat 2047 relevance only where materially supported
- promoter holding, selling, pledge and insider activity
- dividends, splits, bonus, buybacks and dilution
- SEBI, court, NCLT, tax, auditor, governance and regulatory matters
- allegations versus confirmed findings, with current status

Do NOT use ROE/ROCE >20% as a mandatory pass/fail rule. Distinguish temporary/cyclical weakness from structural deterioration. For banks/NBFCs use sector-specific metrics such as ROA, ROE, NIM, asset quality, capital adequacy and credit cost.

Use appropriate valuation:
P/E, historical P/E, PEG, EV/EBITDA, DCF, Reverse DCF, SOTP, P/B/residual-income, dividend/DDM and market-cap/business-size analysis.

Reverse DCF must answer: what future revenue growth, margins and reinvestment are implied by today's market capitalisation?

Build bear/base/bull projections and explain every growth assumption using a business driver.

Final portfolio action buckets:
SELL NOW, REDUCE/SELL LATER, HOLD, ACCUMULATE, BUY NOW, BUY LATER/WAIT, REVIEW/DATA INSUFFICIENT.

Do not present a target price as guaranteed. Explain assumptions, thesis-invalidation conditions and quarterly KPIs to monitor.
`;

app.post("/api/analyze", upload.array("screenshots",10), async (req,res)=>{
  try {
    if(!process.env.OPENAI_API_KEY) return res.status(500).json({error:"OPENAI_API_KEY is not configured on the server."});
    if(!req.files?.length) return res.status(400).json({error:"Upload at least one screenshot."});

    const cfg = JSON.parse(req.body.config || "{}");
    const content = [{
      type:"input_text",
      text:`Analyse this portfolio using these user settings:
Historical: ${cfg.history || "5 Years"}
Forecast: ${cfg.forecast || "5 Years"}
Con-calls: ${cfg.calls || "Latest 4 quarters + relevant history"}
Strategic vision: ${cfg.vision || "10Y + 25Y where documented"}
Risk: ${cfg.risk || "Balanced"}
Output: ${cfg.output || "Detailed analysis"}

Valuation methods: ${(cfg.valuations||[]).join(", ")}

First extract the portfolio table from the screenshots. Flag uncertain OCR. Then perform the requested research and return a structured research report with source citations.`
    }];

    for(const f of req.files){
      const mime = f.mimetype || "image/png";
      const base64 = f.buffer.toString("base64");
      content.push({
        type:"input_image",
        image_url:`data:${mime};base64,${base64}`
      });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-astra",
      instructions: SYSTEM_PROMPT,
      tools: [{type:"web_search"}],
      input:[{role:"user",content}]
    });

    res.json({report: response.output_text || "No report returned."});
  } catch(err){
    console.error(err);
    res.status(500).json({error: err?.message || "Analysis failed."});
  }
});

app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port=Number(process.env.PORT||3000);app.listen(port, "0.0.0.0", () => {
  console.log(`Portfolio AI Analyzer running on port ${port}`);
});
