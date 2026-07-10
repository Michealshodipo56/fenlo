const wrap = () => document.getElementById('nb-toasts');

export function toast(msg, type = '') {
  const w = wrap();
  if (!w) return;
  const t = document.createElement('div');
  t.className = 'nb-toast' + (type ? ` ${type}` : '');
  t.textContent = msg;
  w.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 2200);
  setTimeout(() => t.remove(), 2600);
}
