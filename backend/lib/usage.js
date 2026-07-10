const PLAN_LIMITS = {
  free: () => parseInt(process.env.FREE_TIER_LIMIT || '10', 10),
  student: () => 50,
  pro: () => Infinity,
};

function limitForPlan(plan) {
  const fn = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  return fn();
}

function monthStart() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

export async function getUsage(userId) {
  const { query } = await import('./db.js');
  const limit_default = limitForPlan('free');

  const { rows } = await query(
    `SELECT user_id, count, plan, reset_at FROM usage WHERE user_id = $1`,
    [userId],
  );

  if (!rows.length) {
    return { count: 0, plan: 'free', limit: limit_default, remaining: limit_default };
  }

  let { count, plan, reset_at: resetAt } = rows[0];
  const start = monthStart();

  if (new Date(resetAt) < start) {
    await query(
      `UPDATE usage SET count = 0, reset_at = NOW() WHERE user_id = $1`,
      [userId],
    );
    count = 0;
  }

  const limit = limitForPlan(plan);
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - count);

  return { count, plan, limit, remaining };
}

export async function canGenerate(userId) {
  const usage = await getUsage(userId);
  if (usage.limit === Infinity) return { allowed: true, usage };
  if (usage.count >= usage.limit) {
    return { allowed: false, usage, error: `Free tier limit reached (${usage.limit}/month). Upgrade to continue.` };
  }
  return { allowed: true, usage };
}

export async function incrementUsage(userId) {
  const { query } = await import('./db.js');
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
  const { query } = await import('./db.js');
  await query(
    `INSERT INTO usage (user_id, count, plan, reset_at)
     VALUES ($1, 0, $2, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET plan = $2`,
    [userId, plan],
  );
  return getUsage(userId);
}
