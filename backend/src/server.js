import { loadEnv } from '../lib/load-env.js';
loadEnv();

import express from 'express';
import cors from 'cors';
import { corsOptions } from '../lib/cors.js';
import { pingDb } from '../lib/db.js';
import generateRouter from '../routes/generate.js';
import parseRouter from '../routes/parse.js';
import exportRouter from '../routes/export.js';
import submissionsRouter from '../routes/submissions.js';
import usageRouter from '../routes/usage.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors(corsOptions()));
app.use(express.json({ limit: '2mb' }));

app.get('/health', async (_req, res) => {
  const db = await pingDb();
  res.json({ ok: true, service: 'fenlo-api', db });
});

app.use('/api/generate', generateRouter);
app.use('/api/parse', parseRouter);
app.use('/api/export', exportRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/usage', usageRouter);

app.use((err, _req, res, next) => {
  if (err?.message?.startsWith('CORS blocked')) {
    return res.status(403).json({ error: err.message });
  }
  next(err);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Fenlo API listening on port ${PORT}`);
});
