# AI Portfolio Analyzer

A WhatsApp-shareable web application for analysing Indian stock portfolios from broker screenshots.

## What it does

1. User uploads one or more portfolio screenshots.
2. User selects:
   - historical period
   - forecast period
   - con-call depth
   - strategic vision
   - valuation methods
   - risk framework
3. Backend sends the images and research instructions to the OpenAI Responses API.
4. Web search is enabled for current company research.
5. AI returns a structured portfolio research report.

## Security

**Never put `OPENAI_API_KEY` in `public/index.html` or browser JavaScript.**

The key belongs only in the server environment.

## Local setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```text
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-6-astra
PORT=3000
```

Then:

```bash
npm start
```

Open:

http://localhost:3000

## GitHub + Render deployment

1. Create a new GitHub repository.
2. Upload all files from this project.
3. Create a new Web Service on Render.
4. Connect the GitHub repository.
5. Build command:

```bash
npm install
```

6. Start command:

```bash
npm start
```

7. Add environment variable:

```text
OPENAI_API_KEY = your OpenAI API key
OPENAI_MODEL = gpt-6-astra
```

8. Deploy.
9. Render gives you an HTTPS URL.
10. Send that URL through WhatsApp.

## Important production improvements

Before public use, add:
- authentication or rate limiting
- file retention/deletion policy
- maximum upload size
- abuse protection
- usage/cost limits
- generated PDF/PPT export
- user confirmation of extracted holdings
- persistent research history if required

## Research methodology

The application deliberately does not use ROE/ROCE >20% as a hard filter. It evaluates historical economics, current direction, incremental returns, moat, balance sheet, cash flow, growth and valuation together.

For banks/NBFCs, use sector-specific metrics rather than industrial ROCE/D-E rules.

Current OpenAI API integrations should use the Responses API rather than the retired Assistants API.
