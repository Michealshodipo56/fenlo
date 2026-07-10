export const state = {
  user: null,
  submissions: [],
  usageCount: 0,
  usageLimit: 10,
  plan: 'free',
  usageLoaded: false,
};

export function setUser(user) {
  state.user = user;
  window.dispatchEvent(new CustomEvent('fenlo:state-changed'));
}

export function setUsage({ count, limit, plan, remaining }) {
  state.usageCount = count ?? 0;
  state.usageLimit = limit ?? 10;
  state.plan = plan ?? 'free';
  state.usageLoaded = true;
  window.dispatchEvent(new CustomEvent('fenlo:state-changed'));
}

export function setSubmissions(list) {
  state.submissions = Array.isArray(list) ? list : [];
}

export function getSubmission(id) {
  return state.submissions.find((s) => s.id === id) || null;
}

export function upsertSubmission(sub) {
  const idx = state.submissions.findIndex((s) => s.id === sub.id);
  if (idx >= 0) state.submissions[idx] = sub;
  else state.submissions.unshift(sub);
}

export function canSubmit() {
  if (state.plan === 'pro') return true;
  if (!state.usageLoaded) return true;
  return state.usageCount < state.usageLimit;
}

export function remainingSubmissions() {
  if (state.plan === 'pro') return Infinity;
  return Math.max(0, state.usageLimit - state.usageCount);
}
