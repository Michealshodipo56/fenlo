export const state = {
  user: null,
  submissions: [],
  usageCount: 0,
  usageLimit: 5,
  plan: 'free',
  currentSubmission: null,
};

export function setUser(user) {
  state.user = user;
  window.dispatchEvent(new CustomEvent('fenlo:state-changed'));
}

export function hydrateFromStorage() {
  try {
    const raw = localStorage.getItem('fenlo.state');
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.submissions)) state.submissions = data.submissions;
    if (typeof data.usageCount === 'number') state.usageCount = data.usageCount;
    if (typeof data.usageLimit === 'number') state.usageLimit = data.usageLimit;
    if (data.plan) state.plan = data.plan;
  } catch { /* ignore */ }
}

export function persistToStorage() {
  localStorage.setItem('fenlo.state', JSON.stringify({
    submissions: state.submissions,
    usageCount: state.usageCount,
    usageLimit: state.usageLimit,
    plan: state.plan,
  }));
}

export function addSubmission(sub) {
  state.submissions.unshift(sub);
  state.usageCount += 1;
  persistToStorage();
}

export function getSubmission(id) {
  return state.submissions.find((s) => s.id === id) || null;
}

export function canSubmit() {
  if (state.plan === 'pro' || state.plan === 'student') return true;
  return state.usageCount < state.usageLimit;
}

export function remainingSubmissions() {
  if (state.plan === 'pro' || state.plan === 'student') return Infinity;
  return Math.max(0, state.usageLimit - state.usageCount);
}
