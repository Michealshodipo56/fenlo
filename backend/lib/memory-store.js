/** In-memory store for local testing when Neon is unreachable. */

const usageByUser = new Map();
const submissionsByUser = new Map();
const submissionsById = new Map();

const FREE_LIMIT = () => parseInt(process.env.FREE_TIER_LIMIT || '10', 10);

export function memoryGetUsage(userId) {
  const row = usageByUser.get(userId) || { count: 0, plan: 'free' };
  const limit = row.plan === 'pro' ? Infinity : row.plan === 'student' ? 50 : FREE_LIMIT();
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - row.count);
  return { count: row.count, plan: row.plan, limit, remaining, memory: true };
}

export function memoryCanGenerate(userId) {
  const usage = memoryGetUsage(userId);
  if (usage.limit === Infinity) return { allowed: true, usage };
  if (usage.count >= usage.limit) {
    return { allowed: false, usage, error: `Free tier limit reached (${usage.limit}/month).` };
  }
  return { allowed: true, usage };
}

export function memoryIncrementUsage(userId) {
  const row = usageByUser.get(userId) || { count: 0, plan: 'free' };
  row.count += 1;
  usageByUser.set(userId, row);
  return memoryGetUsage(userId);
}

export function memorySetPlan(userId, plan) {
  const row = usageByUser.get(userId) || { count: 0, plan: 'free' };
  row.plan = plan;
  usageByUser.set(userId, row);
  return memoryGetUsage(userId);
}

export function memoryCreateSubmission(sub) {
  const record = {
    id: sub.id,
    userId: sub.userId,
    title: sub.title,
    input: sub.input,
    output: sub.output,
    mode: sub.mode,
    fileName: sub.fileName || null,
    createdAt: new Date().toISOString(),
  };
  submissionsById.set(record.id, record);
  const list = submissionsByUser.get(sub.userId) || [];
  list.unshift(record);
  submissionsByUser.set(sub.userId, list);
  return record;
}

export function memoryListSubmissions(userId) {
  return submissionsByUser.get(userId) || [];
}

export function memoryGetSubmission(id) {
  return submissionsById.get(id) || null;
}

export function memoryUpdateSubmission(id, output) {
  const record = submissionsById.get(id);
  if (!record) return null;
  record.output = output;
  return record;
}
