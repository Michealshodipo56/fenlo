import { query, hasDb, pingDb } from './db.js';
import * as mem from './memory-store.js';

let forceMemory = process.env.MEMORY_MODE === '1';
let checked = false;

/** Prefer memory store when MEMORY_MODE=1 or Neon is unreachable. */
export async function useMemory() {
  if (process.env.MEMORY_MODE === '1') {
    if (!checked) {
      console.warn('[fenlo] MEMORY_MODE=1 — skipping Neon, using in-memory store');
      checked = true;
      forceMemory = true;
    }
    return true;
  }
  if (forceMemory) return true;
  if (!hasDb()) return true;
  if (checked) return forceMemory;
  checked = true;
  const ping = await pingDb();
  if (!ping.connected) {
    console.warn('[fenlo] DB unreachable — using in-memory store for local testing:', ping.reason);
    forceMemory = true;
  }
  return forceMemory;
}

export async function getUsage(userId) {
  if (await useMemory()) return mem.memoryGetUsage(userId);

  const { rows } = await query(
    `SELECT user_id, count, plan, reset_at FROM usage WHERE user_id = $1`,
    [userId],
  );

  const limit_default = parseInt(process.env.FREE_TIER_LIMIT || '10', 10);

  if (!rows.length) {
    return { count: 0, plan: 'free', limit: limit_default, remaining: limit_default };
  }

  let { count, plan, reset_at: resetAt } = rows[0];
  const start = monthStart();

  if (new Date(resetAt) < start) {
    await query(`UPDATE usage SET count = 0, reset_at = NOW() WHERE user_id = $1`, [userId]);
    count = 0;
  }

  const limit = limitForPlan(plan);
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - count);
  return { count, plan, limit, remaining };
}

export async function canGenerate(userId) {
  if (await useMemory()) return mem.memoryCanGenerate(userId);
  const usage = await getUsage(userId);
  if (usage.limit === Infinity) return { allowed: true, usage };
  if (usage.count >= usage.limit) {
    return { allowed: false, usage, error: `Free tier limit reached (${usage.limit}/month). Upgrade to continue.` };
  }
  return { allowed: true, usage };
}

export async function incrementUsage(userId) {
  if (await useMemory()) return mem.memoryIncrementUsage(userId);
  await query(
    `INSERT INTO usage (user_id, count, plan, reset_at)
     VALUES ($1, 1, 'free', NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET count = usage.count + 1`,
    [userId],
  );
  return getUsage(userId);
}

export async function setPlan(userId, plan) {
  if (await useMemory()) return mem.memorySetPlan(userId, plan);
  await query(
    `INSERT INTO usage (user_id, count, plan, reset_at)
     VALUES ($1, 0, $2, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET plan = $2`,
    [userId, plan],
  );
  return getUsage(userId);
}

const PLAN_LIMITS = {
  free: () => parseInt(process.env.FREE_TIER_LIMIT || '10', 10),
  student: () => 50,
  pro: () => Infinity,
};

function limitForPlan(plan) {
  return (PLAN_LIMITS[plan] || PLAN_LIMITS.free)();
}

function monthStart() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}
