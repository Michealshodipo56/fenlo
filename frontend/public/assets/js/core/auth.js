import { NEON_AUTH_URL } from './config.js';

const AUTH_URL = (NEON_AUTH_URL || window.__FENLO_NEON_AUTH_URL__ || '').replace(/\/$/, '');
const NEON_JS_VERSION = '0.6.2-beta';

let _client = null;
let _loadPromise = null;

export function isAuthConfigured() {
  return Boolean(AUTH_URL);
}

export function authConfigError() {
  return 'Neon Auth is not configured. Add NEON_AUTH_URL in Vercel → Settings → Environment Variables, then redeploy.';
}

async function getAuthClient() {
  if (!AUTH_URL) return null;
  if (_client) return _client;
  if (!_loadPromise) {
    _loadPromise = import(
      `https://esm.sh/@neondatabase/neon-js@${NEON_JS_VERSION}/auth`
    ).then((mod) => {
      _client = mod.createAuthClient(AUTH_URL);
      return _client;
    }).catch((err) => {
      _loadPromise = null;
      throw err;
    });
  }
  return _loadPromise;
}

function mapUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email?.split('@')[0] || 'Student',
    avatar: user.image || null,
  };
}

export async function signInWithGoogle() {
  const auth = await getAuthClient();
  if (!auth) throw new Error(authConfigError());

  const result = await auth.signIn.social({
    provider: 'google',
    callbackURL: window.location.href,
  });

  if (result?.error) {
    throw new Error(result.error.message || 'Google sign-in failed');
  }
}

export async function signInWithEmail({ email, password, isSignUp = false }) {
  const auth = await getAuthClient();
  if (!auth) throw new Error(authConfigError());

  const result = isSignUp
    ? await auth.signUp.email({
        name: email.split('@')[0] || 'Student',
        email,
        password,
      })
    : await auth.signIn.email({ email, password });

  if (result?.error) {
    throw new Error(result.error.message || 'Sign-in failed');
  }
}

export async function signOut() {
  const auth = await getAuthClient();
  if (!auth) return;
  const result = await auth.signOut();
  if (result?.error) {
    throw new Error(result.error.message || 'Sign-out failed');
  }
}

export async function currentUser() {
  if (!AUTH_URL) return null;
  try {
    const auth = await getAuthClient();
    if (!auth) return null;
    const result = await auth.getSession();
    if (result?.error) return null;
    return mapUser(result?.data?.user);
  } catch {
    return null;
  }
}

export function onAuthChange(cb) {
  currentUser().then(cb);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') currentUser().then(cb);
  });
  window.addEventListener('focus', () => currentUser().then(cb));
}
