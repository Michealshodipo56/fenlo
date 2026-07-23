import pg from 'pg';
import {
  memoryGetUsage,
  memoryCanGenerate,
  memoryIncrementUsage,
  memorySetPlan,
  memoryCreateSubmission,
  memoryListSubmissions,
  memoryGetSubmission,
  memoryUpdateSubmission,
} from './memory-store.js';

const { Pool } = pg;

let pool = null;
let dbReachable = null; // null = unknown, true/false after probe
let lastProbeAt = 0;

export function hasDb() {
  return Boolean(process.env.DATABASE_URL);
}

export function forceMemoryMode() {
  return process.env.MEMORY_MODE === '1' || process.env.MEMORY_MODE === 'true';
}

export function getPool() {
  if (!hasDb() || forceMemoryMode()) return null;
  if (!pool) {
    const url = process.env.DATABASE_URL || '';
    const needsSsl =
      process.env.NODE_ENV === 'production' ||
      /neon\.tech|sslmode=require/i.test(url);
    pool = new Pool({
      connectionString: url,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
      max: 5,
      connectionTimeoutMillis: 8000,
    });
  }
  return pool;
}

export async function pingDb() {
  if (forceMemoryMode()) {
    return { connected: false, reason: 'MEMORY_MODE=1 (local in-memory store)', memory: true };
  }
  const p = getPool();
  if (!p) return { connected: false, reason: 'DATABASE_URL not set', memory: true };
  try {
    await p.query('SELECT 1');
    dbReachable = true;
    lastProbeAt = Date.now();
    return { connected: true };
  } catch (err) {
    dbReachable = false;
    lastProbeAt = Date.now();
    return { connected: false, reason: err.message, memory: true };
  }
}

/** Prefer Neon; fall back to memory when unreachable (school networks often block :5432). */
export async function useMemory() {
  if (forceMemoryMode() || !hasDb()) return true;
  if (dbReachable === true && Date.now() - lastProbeAt < 30_000) return false;
  if (dbReachable === false && Date.now() - lastProbeAt < 30_000) return true;
  const ping = await pingDb();
  return !ping.connected;
}

export async function query(text, params = []) {
  const p = getPool();
  if (!p) throw new Error('Database not configured');
  try {
    const result = await p.query(text, params);
    dbReachable = true;
    lastProbeAt = Date.now();
    return result;
  } catch (err) {
    dbReachable = false;
    lastProbeAt = Date.now();
    throw err;
  }
}

export const memory = {
  getUsage: memoryGetUsage,
  canGenerate: memoryCanGenerate,
  incrementUsage: memoryIncrementUsage,
  setPlan: memorySetPlan,
  createSubmission: memoryCreateSubmission,
  listSubmissions: memoryListSubmissions,
  getSubmission: memoryGetSubmission,
  updateSubmission: memoryUpdateSubmission,
};
