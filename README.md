<p align="center">
  <img src="frontend/public/assets/img/fenlo-logo.svg" alt="Fenlo" width="96" height="96">
</p>

# Fenlo

**Upload an assignment → get a polished answer back.**

Fenlo is an AI assignment helper for students. Paste instructions or upload a PDF/DOCX/image, choose **Full Assignment** or **Direct Answer**, then export to PDF, Word, TXT, or Markdown.

| | |
|---|---|
| **Live app** | [fenlo.vercel.app](https://fenlo.vercel.app) |
| **API** | [fenlo.onrender.com](https://fenlo.onrender.com/health) |
| **For** | Learning / study aid — not for submitting AI work as your own |

---

## Features

- **Two output modes** — full structured assignment, or a concise direct answer
- **File upload** — PDF, DOCX, and images (text extracted on the backend)
- **Export** — PDF · DOCX · TXT · Markdown
- **History** — past submissions tied to your account (or guest ID)
- **Auth** — Google + email via Neon Auth
- **Usage limits** — free / student / pro plans

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vanilla HTML/CSS/JS SPA → **Vercel** |
| Backend | Express (Node 18+) → **Render** |
| Database | **Neon** Postgres |
| Auth | **Neon Auth** (Google + email) |
| AI | **Groq** (primary) · Gemini (optional fallback) |

```
fenlo/
├── frontend/     # Vercel SPA
├── backend/      # Render API
└── README.md
```

---

## Plans

| Plan | Price | Submissions / month |
|------|-------|---------------------|
| Free | $0 | 10 |
| Student | $1 | 50 |
| Pro | $5 | Unlimited |

> Payment (Paystack) is not wired yet — plan switches in the UI update the DB for testing.

---

## Quick start (local)

**Requirements:** Node.js 18+, Neon project (DB + Auth), Groq API key.

```bash
git clone https://github.com/Michealshodipo56/fenlo.git
cd fenlo
npm run install:all
```

### 1. Neon

1. Create a Neon project and enable **Auth**
2. SQL Editor → run [`backend/sql/schema.sql`](backend/sql/schema.sql)
3. Copy:
   - `DATABASE_URL` (Connect)
   - Auth Base URL (Auth → Configuration) → this is `NEON_AUTH_URL`

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Fill in:

```env
DATABASE_URL=postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require
GROQ_API_KEY=gsk_...
ALLOWED_ORIGINS=http://localhost:3000
PORT=4000
FREE_TIER_LIMIT=10
```

```bash
npm run dev
# → http://localhost:4000
# → GET /health should show { ok: true, db: { connected: true } }
```

Without `GROQ_API_KEY` (or `GEMINI_API_KEY`), generate returns **Demo Mode** stub text.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
```

```env
API_URL=http://localhost:4000
NEON_AUTH_URL=https://ep-xxx.neonauth..../neondb/auth
SITE_URL=http://localhost:3000
```

```bash
npm run build && npm run dev
# → http://localhost:3000
```

From the repo root you can also use:

```bash
npm run dev:backend
npm run build:frontend && npm run dev:frontend
```

---

## Deploy

### Backend → Render

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build | `npm install` |
| Start | `npm start` |
| Health check | `/health` |

**Env vars:**

| Key | Example |
|-----|---------|
| `DATABASE_URL` | Neon connection string |
| `GROQ_API_KEY` | from [console.groq.com](https://console.groq.com/keys) |
| `GROQ_MODEL` | `llama-3.3-70b-versatile` (optional) |
| `GEMINI_API_KEY` | optional fallback |
| `ALLOWED_ORIGINS` | `https://fenlo.vercel.app` |
| `FREE_TIER_LIMIT` | `10` |
| `NODE_ENV` | `production` |

Production API: `https://fenlo.onrender.com`

### Frontend → Vercel

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build | `npm run build` |
| Output | `public` |

**Env vars:**

| Key | Example |
|-----|---------|
| `API_URL` | `https://fenlo.onrender.com` |
| `NEON_AUTH_URL` | Neon Auth Base URL |
| `SITE_URL` | `https://fenlo.vercel.app` |
| `GOOGLE_SITE_VERIFICATION` | Search Console content value (optional) |
| `OG_IMAGE_URL` | `/assets/img/og-cover.jpg` (optional) |

Build injects config, SEO meta, `robots.txt`, and `sitemap.xml`.

Production app: `https://fenlo.vercel.app`

### After first deploy

1. Render `ALLOWED_ORIGINS` includes `https://fenlo.vercel.app`
2. Neon Auth **Trusted domains** includes `fenlo.vercel.app`
3. Neon Auth has Google (and/or email) enabled
4. Redeploy frontend after setting `NEON_AUTH_URL`

---

## Environment reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes | Neon Postgres URL |
| `GROQ_API_KEY` | yes* | Primary AI — without it you get Demo Mode |
| `GEMINI_API_KEY` | no | Fallback if Groq fails / missing |
| `GROQ_MODEL` | no | Default `llama-3.3-70b-versatile` |
| `ALLOWED_ORIGINS` | yes | Comma-separated frontend origins |
| `FREE_TIER_LIMIT` | no | Default `10` |
| `PORT` | no | Default `4000` |

\*Or `GEMINI_API_KEY` alone.

### Frontend (Vercel / `frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `API_URL` | yes | Backend base URL |
| `NEON_AUTH_URL` | yes | Neon Auth Base URL (sign-in) |
| `SITE_URL` | yes (prod) | Canonical / sitemap / OG base |
| `GOOGLE_SITE_VERIFICATION` | no | GSC HTML tag content |
| `OG_IMAGE_URL` | no | Default `/assets/img/og-cover.jpg` |

---

## API

All generate/history routes expect header:

```
X-Fenlo-User-Id: <guest-or-auth-user-id>
```

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health + DB status |
| `GET` | `/api/usage` | Plan + remaining quota |
| `GET` | `/api/submissions` | List history |
| `GET` | `/api/submissions/:id` | One result |
| `POST` | `/api/generate` | Generate + save |
| `POST` | `/api/submissions/:id/regenerate` | Regenerate |
| `POST` | `/api/parse` | Parse uploaded file |
| `POST` | `/api/export` | Export PDF / DOCX / TXT / MD |

---

## Project layout

```
frontend/
  public/           # static SPA (HTML, CSS, JS, assets)
  scripts/          # build: CSS bundle, config inject, sitemap
  vercel.json

backend/
  src/server.js     # Express entry
  routes/           # generate, submissions, usage, parse, export
  lib/              # ai, db, usage, cors
  sql/schema.sql
  render.yaml
```

---

## SEO / Search Console

After deploy:

1. Verify property `https://fenlo.vercel.app/` in [Google Search Console](https://search.google.com/search-console)
2. Submit sitemap: `https://fenlo.vercel.app/sitemap.xml`
3. Preview image: `https://fenlo.vercel.app/assets/img/og-cover.jpg`  
   Clear social cache with [Meta Sharing Debugger](https://developers.facebook.com/tools/debug/) if the preview looks stale

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **“Demo Mode”** in answers | Set `GROQ_API_KEY` (or `GEMINI_API_KEY`) on Render → redeploy |
| Sign-in fails / redirects weirdly | Set `NEON_AUTH_URL` on Vercel; add domain to Neon Auth trusted domains |
| CORS errors in browser | Add the frontend origin to Render `ALLOWED_ORIGINS` |
| `/health` → DB not connected | Check `DATABASE_URL`; run `schema.sql` in Neon |
| Sitemap / OG tags wrong | Set `SITE_URL=https://fenlo.vercel.app` on Vercel → redeploy |

---

## License

Private / personal project. Use as a **learning aid** — follow your school's academic integrity rules.
