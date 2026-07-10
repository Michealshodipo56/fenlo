const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export function corsOptions() {
  return {
    origin(origin, cb) {
      if (!origin || allowed.includes('*') || allowed.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'X-Fenlo-User-Id'],
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  };
}

export function allowedOrigins() {
  return allowed;
}
