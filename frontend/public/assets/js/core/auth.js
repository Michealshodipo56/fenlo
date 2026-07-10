import { NEON_AUTH_URL } from './config.js';

const AUTH_URL = NEON_AUTH_URL || window.__FENLO_NEON_AUTH_URL__ || '';

export async function signInWithGoogle() {
  if (!AUTH_URL) {
    throw new Error('Neon Auth not configured — set NEON_AUTH_URL in Vercel env vars');
  }
  // Neon Auth sign-in — redirect to auth UI (configure in Neon Console)
  const returnTo = encodeURIComponent(window.location.href);
  window.location.href = `${AUTH_URL}/sign-in?redirect=${returnTo}`;
}

export async function signOut() {
  if (!AUTH_URL) return;
  window.location.href = `${AUTH_URL}/sign-out?redirect=${encodeURIComponent(window.location.origin)}`;
}

export async function currentUser() {
  if (!AUTH_URL) return null;
  try {
    const res = await fetch(`${AUTH_URL}/get-session`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    const u = data?.user || data?.session?.user;
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      name: u.name || u.email?.split('@')[0] || 'Student',
      avatar: u.image || null,
    };
  } catch {
    return null;
  }
}

export function onAuthChange(cb) {
  currentUser().then(cb);
}
