### backend

```shell

cd /home/dell/projects/fenlo/backend

export DATABASE_URL="postgresql://...your-neon-url..."
export GROQ_API_KEY="gsk_...your-key..."
export ALLOWED_ORIGINS="http://localhost:3000"
export PORT=4000

npm run dev

```


### frontend

```shell

cd /home/dell/projects/fenlo/frontend

API_URL=http://localhost:4000 \
NEON_AUTH_URL="https://ep-xxx.neonauth..../neondb/auth" \
SITE_URL=http://localhost:3000 \
npm run build && npm run dev

```