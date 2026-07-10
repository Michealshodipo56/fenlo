import { hydrateFromStorage, setUser, setUsage, setSubmissions } from './core/state.js';
import { register, bootFromPath } from './core/router.js';
import { onAuthChange, currentUser, signOut, signInWithGoogle } from './core/auth.js';
import { topbar, rerenderTopbar } from './components/topbar.js';
import { toast } from './core/toast.js';
import { API } from './core/api.js';

const root = document.getElementById('app');

register('home', () => import('./pages/home.js').then((m) => m.renderHome()));
register('submit', () => import('./pages/submit.js').then((m) => m.renderSubmit()));
register('result', (p) => import('./pages/result.js').then((m) => m.renderResult(p)));
register('history', () => import('./pages/history.js').then((m) => m.renderHistory()));
register('pricing', () => import('./pages/pricing.js').then((m) => m.renderPricing()));
register('about', () => import('./pages/about.js').then((m) => m.renderAbout()));

document.addEventListener('click', async (e) => {
  const userBtn = e.target.closest('.nb-user-btn');
  if (userBtn) {
    userBtn.closest('.nb-user')?.classList.toggle('open');
    return;
  }
  if (!e.target.closest('.nb-user')) {
    document.querySelectorAll('.nb-user.open').forEach((el) => el.classList.remove('open'));
  }

  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  if (action === 'signin') {
    try { await signInWithGoogle(); }
    catch (err) { toast(err.message || 'Sign-in failed', 'err'); }
  }
  if (action === 'signout') {
    try { await signOut(); toast('Signed out.', 'ok'); }
    catch { toast('Sign-out failed.', 'err'); }
  }
});

async function syncFromServer() {
  try {
    const [usageRes, subsRes] = await Promise.all([
      API.getUsage(),
      API.getSubmissions(),
    ]);
    setUsage(usageRes);
    setSubmissions(subsRes.submissions || []);
  } catch (err) {
    console.warn('syncFromServer:', err.message);
  }
}

async function init() {
  root.innerHTML = topbar('home') + '<div style="padding:60px 24px;font-family:var(--mono);font-size:13px;color:var(--ink-3);text-align:center">loading…</div>';

  try {
    const user = await currentUser();
    setUser(user);
  } catch { /* anonymous OK */ }

  await syncFromServer();
  bootFromPath('home');

  let firstAuth = true;
  onAuthChange(async (user) => {
    setUser(user);
    await syncFromServer();
    if (firstAuth) { firstAuth = false; return; }
    bootFromPath('home');
  });
}

document.addEventListener('fenlo:usage', (e) => setUsage(e.detail));
document.addEventListener('fenlo:state-changed', rerenderTopbar);

init();
