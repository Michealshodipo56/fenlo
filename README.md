# Fenlo — monorepo

| Folder | Host | Role |
|--------|------|------|
| `frontend/` | **Vercel** | SPA UI |
| `backend/` | **Render** | Express API + Neon Postgres |

## 1. Neon setup

1. Create project → enable **Auth**
2. **SQL Editor** → run `backend/sql/schema.sql`
3. Copy from Neon Console:
   - `DATABASE_URL` (Connect tab)
   - `NEON_AUTH_URL` (Auth tab) → set as `NEON_AUTH_URL` on Vercel

## 2. Render (backend)

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build | `npm install` |
| Start | `npm start` |

**Environment variables:**

```
DATABASE_URL=postgresql://...
GROQ_API_KEY=...
ALLOWED_ORIGINS=https://your-app.vercel.app
FREE_TIER_LIMIT=10
NODE_ENV=production
```

Health check: `GET /health` → `{ ok: true, db: { connected: true } }`

## 3. Vercel (frontend)

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build | `npm run build` |
| Output | `public` |

**Environment variables:**

```
API_URL=https://your-api.onrender.com
NEON_AUTH_URL=https://ep-xxx.neonauth.us-east-1.aws.neon.tech/neondb/auth
```

Get `NEON_AUTH_URL` from **Neon Console → Auth → Configuration → Auth Base URL**.

### Neon Auth setup (required for sign-in)

1. Neon Console → **Auth** → enable Google (and/or email)
2. **Trusted domains** — add your Vercel URL (e.g. `fenlo.vercel.app`)
3. Copy **Auth Base URL** → set as `NEON_AUTH_URL` on Vercel
4. Redeploy frontend

## 4. After deploy

1. Add Vercel URL to Render `ALLOWED_ORIGINS`
2. Add Vercel URL to Neon Auth **trusted domains**
3. Redeploy both services

## Local dev

```bash
# Terminal 1 — backend
cd backend
cp .env.example .env
# Add DATABASE_URL + GROQ_API_KEY
npm install && npm run dev

# Terminal 2 — frontend
cd frontend
cp .env.example .env
export API_URL=http://localhost:4000
npm install && npm run build && npm run dev
```

Open http://localhost:3000

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health + DB status |
| GET | `/api/usage` | Usage limits (requires `X-Fenlo-User-Id`) |
| GET | `/api/submissions` | List history |
| GET | `/api/submissions/:id` | Get one result |
| POST | `/api/generate` | Generate + save submission |
| POST | `/api/submissions/:id/regenerate` | Regenerate output |
| POST | `/api/parse` | Parse uploaded file |
| POST | `/api/export` | Export PDF/DOCX/TXT/MD |

Users are identified by `X-Fenlo-User-Id` header (guest ID in localStorage, or Neon Auth user ID when signed in).
