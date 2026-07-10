import { esc } from '../core/helpers.js';
import { toast } from '../core/toast.js';
import {
  isAuthConfigured,
  authConfigError,
  signInWithGoogle,
  signInWithEmail,
} from '../core/auth.js';

export function openLoginModal() {
  if (document.querySelector('.nb-wall.is-login')) return;

  const w = document.createElement('div');
  w.className = 'nb-wall is-login';
  w.setAttribute('aria-hidden', 'false');

  const configured = isAuthConfigured();

  w.innerHTML = `
    <div class="nb-wall-card nb-login-card" role="dialog" aria-modal="true" aria-labelledby="login-title">
      <button class="nb-dl-close" type="button" aria-label="Close" data-login-close>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <h3 id="login-title">Sign in to <em>Fenlo</em></h3>
      <p class="nb-login-sub">Save your history across devices and sync your usage.</p>

      ${configured ? `
      <div class="nb-login-actions">
        <button class="nb-btn primary nb-login-google" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.35 11.1h-9.1v2.9h5.25a4.6 4.6 0 0 1-2 3.02v2.5h3.25c1.9-1.75 3-4.33 3-7.42 0-.68-.06-1.34-.17-2z"/><path fill="currentColor" d="M12 22c2.7 0 5-0.9 6.65-2.45l-3.25-2.5c-.9.6-2.04.95-3.4.95-2.62 0-4.84-1.77-5.63-4.15H3.08v2.58A10 10 0 0 0 12 22z"/><path fill="currentColor" d="M6.37 13.85A5.98 5.98 0 0 1 6 12c0-.65.12-1.27.37-1.85V7.57H3.08A10 10 0 0 0 2 12c0 1.62.39 3.15 1.08 4.43l3.29-2.58z"/><path fill="currentColor" d="M12 5.38c1.47 0 2.78.5 3.82 1.48l2.86-2.86C17 2.48 14.7 1.5 12 1.5 7.58 1.5 3.91 3.96 2.08 7.57l3.29 2.58C6.16 7.77 8.38 5.38 12 5.38z"/></svg>
          continue with Google
        </button>
      </div>

      <div class="nb-login-divider"><span>or use email</span></div>

      <form class="nb-login-form" id="login-form" novalidate>
        <label class="nb-dl-field">
          <span class="nb-dl-label">Email</span>
          <div class="nb-dl-input"><input type="email" id="login-email" autocomplete="email" required placeholder="you@school.edu"></div>
        </label>
        <label class="nb-dl-field">
          <span class="nb-dl-label">Password</span>
          <div class="nb-dl-input"><input type="password" id="login-password" autocomplete="current-password" required minlength="8" placeholder="8+ characters"></div>
        </label>
        <button class="nb-btn primary" type="submit" id="login-submit">sign in →</button>
        <p class="nb-login-toggle">
          <span id="login-mode-label">No account?</span>
          <button type="button" class="nb-login-switch" id="login-mode-switch">Create one</button>
        </p>
      </form>` : `
      <div class="nb-callout warn" style="margin:0;text-align:left">
        <div class="ic">!</div>
        <div>
          <h5>Auth not configured</h5>
          <p>${esc(authConfigError())}</p>
          <p style="margin-top:8px;font-size:13px">Copy your <strong>Auth Base URL</strong> from Neon Console → Auth → Configuration.</p>
        </div>
      </div>`}
    </div>`;

  document.body.appendChild(w);

  const close = () => w.remove();
  w.querySelector('[data-login-close]')?.addEventListener('click', close);
  w.addEventListener('click', (e) => { if (e.target === w) close(); });

  if (!configured) return;

  let isSignUp = false;
  const form = w.querySelector('#login-form');
  const modeLabel = w.querySelector('#login-mode-label');
  const modeSwitch = w.querySelector('#login-mode-switch');
  const submitBtn = w.querySelector('#login-submit');
  const pwInput = w.querySelector('#login-password');

  modeSwitch?.addEventListener('click', () => {
    isSignUp = !isSignUp;
    modeLabel.textContent = isSignUp ? 'Already have an account?' : 'No account?';
    modeSwitch.textContent = isSignUp ? 'Sign in' : 'Create one';
    submitBtn.textContent = isSignUp ? 'create account →' : 'sign in →';
    pwInput.autocomplete = isSignUp ? 'new-password' : 'current-password';
  });

  w.querySelector('.nb-login-google')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = 'redirecting…';
    try {
      await signInWithGoogle();
      close();
    } catch (err) {
      toast(err.message || 'Google sign-in failed', 'err');
      btn.disabled = false;
      btn.innerHTML = 'continue with Google';
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = w.querySelector('#login-email')?.value?.trim();
    const password = w.querySelector('#login-password')?.value;
    if (!email || !password) return;

    submitBtn.disabled = true;
    submitBtn.textContent = isSignUp ? 'creating…' : 'signing in…';
    try {
      await signInWithEmail({ email, password, isSignUp });
      close();
      toast(isSignUp ? 'Account created.' : 'Signed in.', 'ok');
      window.dispatchEvent(new CustomEvent('fenlo:auth-changed'));
    } catch (err) {
      toast(err.message || 'Sign-in failed', 'err');
      submitBtn.disabled = false;
      submitBtn.textContent = isSignUp ? 'create account →' : 'sign in →';
    }
  });
}
