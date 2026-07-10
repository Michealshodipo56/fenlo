# Fenlo — monorepo

AI assignment platform split into two deployable services:

| Folder | Host | What it runs |
|--------|------|--------------|
| `frontend/` | **Vercel** | Static SPA (Studora UI) |
| `backend/` | **Render** | Express API (AI, parse, export) |

## Local development

**Terminal 1 — backend (port 4000):**
```bash
cd backend
cp .env.example .env
# Add GROQ_API_KEY (free at console.groq.com)
npm install
npm run dev
```

**Terminal 2 — frontend (port 3000):**
```bash
cd frontend
cp .env.example .env
# Set API_URL=http://localhost:4000
npm install
export API_URL=http://localhost:4000
npm run build
npm run dev
```

Open **http://localhost:3000**

## Deploy

### Backend → Render

1. New **Web Service** → connect GitHub repo
2. **Root Directory:** `backend`
3. **Build:** `npm install`
4. **Start:** `npm start`
5. **Env vars:** `GROQ_API_KEY`, `ALLOWED_ORIGINS` (your Vercel URL), `DATABASE_URL` (Neon)

Or use the Blueprint: point Render at `backend/render.yaml`.

### Frontend → Vercel

1. New project → connect same GitHub repo
2. **Root Directory:** `frontend`
3. **Framework:** Other
4. **Build Command:** `npm run build`
5. **Output Directory:** `public`
6. **Env vars:**
   - `API_URL` = your Render backend URL (e.g. `https://fenlo-api.onrender.com`)
   - `NEON_AUTH_URL` = Neon Auth URL from Neon Console

### After deploy

1. Set Render `ALLOWED_ORIGINS` to your Vercel URL
2. Add Vercel URL to Neon Auth trusted domains
3. Run `backend/sql/schema.sql` in Neon SQL Editor

## Stack

- **Frontend:** HTML, CSS, vanilla JS
- **Backend:** Node.js, Express
- **Database:** Neon Postgres
- **Auth:** Neon Auth
- **AI:** Groq (free) or Gemini (free)
