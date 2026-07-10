import { state } from '../core/state.js';
import { esc } from '../core/helpers.js';

export function fenloLockup() {
  return `<img class="mark" src="/assets/img/fenlo-logo.svg" alt="" decoding="async"><span class="word">enlo</span><em class="nb-logo-tag">/assignments</em>`;
}

export function hrefFor(nav) {
  const map = { home: '/', submit: '/submit', history: '/history', pricing: '/pricing', about: '/about' };
  return map[nav] || '/';
}

export function topbar(active = 'home') {
  const usage = state.plan === 'free'
    ? `<span class="nb-usage-pill"><b>${state.usageCount}</b> / ${state.usageLimit} free</span>`
    : `<span class="nb-sticker g">${state.plan}</span>`;

  const cta = state.user
    ? userMenu(state.user)
    : `<button class="nb-btn primary" data-action="signin" type="button">sign in →</button>`;

  return `<header class="nb-top"><div class="nb-top-in">
    <a class="nb-logo" data-nav="home" href="/" aria-label="Fenlo home">${fenloLockup()}</a>
    <button class="nb-burger" type="button" aria-expanded="false" aria-controls="nb-mobile-nav" aria-label="Open navigation menu">
      <span class="nb-burger-line" aria-hidden="true"></span>
      <span class="nb-burger-line" aria-hidden="true"></span>
    </button>
    <nav class="nb-nav" id="nb-mobile-nav" aria-label="Primary">
      <a data-nav="home" href="/" class="${active === 'home' ? 'active' : ''}">home</a>
      <a data-nav="submit" href="/submit" class="${active === 'submit' ? 'active' : ''}">new assignment</a>
      <a data-nav="history" href="/history" class="${active === 'history' ? 'active' : ''}">history</a>
      <a data-nav="pricing" href="/pricing" class="${active === 'pricing' ? 'active' : ''}">pricing</a>
      <a data-nav="about" href="/about" class="${active === 'about' ? 'active' : ''}">about</a>
    </nav>
    <div class="nb-top-cta">${usage} ${cta}</div>
  </div></header>`;
}

function userMenu(user) {
  const initial = (user.name || '?').charAt(0).toUpperCase();
  const avatarSrc = user.avatar ? `<img src="${esc(user.avatar)}" alt="" referrerpolicy="no-referrer">` : initial;
  return `<div class="nb-user" tabindex="0">
    <button class="nb-user-btn" type="button" aria-haspopup="menu" aria-expanded="false">
      <span class="nb-avatar" aria-hidden="true">${avatarSrc}</span>
      <span class="nb-user-name">${esc(user.name)}</span>
    </button>
    <div class="nb-user-pop" role="menu">
      <div class="nb-user-id">
        <div class="nb-user-name-full">${esc(user.name)}</div>
        <div class="nb-user-email">${esc(user.email || '')}</div>
      </div>
      <button type="button" data-action="signout" role="menuitem">sign out</button>
    </div>
  </div>`;
}

export function footer() {
  return `<footer class="nb-foot"><div class="nb-foot-in">
    <div>© Fenlo · AI assignment platform · <em style="font-family:var(--serif);font-style:italic">for learning purposes</em></div>
    <div>
      <a data-nav="home" href="/">home</a>
      <a data-nav="submit" href="/submit">submit</a>
      <a data-nav="history" href="/history">history</a>
      <a data-nav="pricing" href="/pricing">pricing</a>
      <a data-nav="about" href="/about">about</a>
    </div>
  </div></footer>`;
}

export function rerenderTopbar() {
  const existing = document.querySelector('.nb-top');
  if (!existing) return false;
  const active = existing.querySelector('.nb-nav a.active')?.dataset.nav || 'home';
  const tmp = document.createElement('div');
  tmp.innerHTML = topbar(active);
  existing.replaceWith(tmp.firstElementChild);
  return true;
}
