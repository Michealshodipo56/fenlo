import pg from 'pg';

const { Pool } = pg;

let pool = null;

export function hasDb() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!hasDb()) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 10,
    });
  }
  return pool;
}

export async function pingDb() {
  const p = getPool();
  if (!p) return { connected: false, reason: 'DATABASE_URL not set' };
  try {
    await p.query('SELECT 1');
    return { connected: true };
  } catch (err) {
    return { connected: false, reason: err.message };
  }
}

export async function query(text, params = []) {
  const p = getPool();
  if (!p) throw new Error('Database not configured');
  return p.query(text, params);
}
