# Fenlo

AI assignment completion platform for students. Upload assignments (text or files), choose output style, and download formatted results.

Built with the **Studora** notebook UI — paper backgrounds, ink borders, Fraunces serif accents, and the same calm, distraction-free design language.

## Features (MVP)

- **Submit** — paste text or upload PDF, DOCX, TXT, images
- **Output modes** — Full Assignment (formatted essay/report) or Direct Answer (concise solution)
- **Export** — PDF, DOCX, TXT, Markdown
- **History** — local submission history in browser storage
- **Pricing** — freemium with usage limits (demo plan switching)
- **Auth** — Google sign-in via Supabase (optional)

## Quick start

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY for real AI generation
npm run build:css
npm start                    # vercel dev on http://localhost:3000
```

Without `OPENAI_API_KEY`, the app runs in **demo mode** with sample generated content.

## Environment variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key for assignment generation |
| `SUPABASE_URL` | Supabase project URL (optional, for auth) |
| `SUPABASE_ANON_KEY` | Supabase anon key (expose via `window.__FENLO_SUPABASE_*` in production) |
| `FREE_TIER_LIMIT` | Free submissions per month (default: 5) |

## Stack

- **Frontend** — Vanilla JS SPA (Studora design system)
- **Backend** — Vercel serverless functions
- **AI** — OpenAI GPT-4o-mini
- **Export** — pdf-lib, docx
- **Parsing** — pdf-parse, mammoth

## Deploy

```bash
npm run deploy
```

## Academic integrity

Fenlo is positioned as a **study and learning aid**. Students should use generated content to understand concepts — not submit it as their own work.

## License

Private — Micheal Shodipo
