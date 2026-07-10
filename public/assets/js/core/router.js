const handlers = new Map();
let currentView = null;

export function register(name, handler) {
  handlers.set(name, handler);
}

export async function navigate(view, params = {}) {
  const handler = handlers.get(view);
  if (!handler) return;
  currentView = view;
  const target = pathFor(view, params);
  if (location.pathname !== target) {
    history.pushState({ view }, '', target);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  await handler(params);
}

function pathFor(view, params) {
  if (view === 'home') return '/';
  if (view === 'result' && params.id) return `/result/${encodeURIComponent(params.id)}`;
  return `/${view}`;
}

export function bootFromPath(fallback = 'home') {
  const path = location.pathname.replace(/^\/+|\/+$/g, '');
  if (!path) return navigate(fallback);
  const [view, id] = path.split('/').filter(Boolean);
  if (view === 'result' && id) return navigate('result', { id: decodeURIComponent(id) });
  if (handlers.has(view)) return navigate(view);
  return navigate(fallback);
}

export function wireNav(root) {
  if (!root) return;
  root.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
      e.preventDefault();
      const panel = el.closest('.nb-nav.open');
      if (panel) {
        panel.classList.remove('open');
        document.querySelector('.nb-burger[aria-expanded="true"]')?.setAttribute('aria-expanded', 'false');
      }
      navigate(el.dataset.nav);
    });
  });
  root.querySelectorAll('.nb-burger').forEach((btn) => {
    if (btn.dataset.wired) return;
    btn.dataset.wired = '1';
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!expanded));
      panel?.classList.toggle('open', !expanded);
    });
  });
}

window.addEventListener('popstate', () => bootFromPath(currentView || 'home'));
