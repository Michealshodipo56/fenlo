const SUPABASE_URL = window.__FENLO_SUPABASE_URL__ || '';
const SUPABASE_ANON_KEY = window.__FENLO_SUPABASE_ANON_KEY__ || '';
const VENDOR_URL = '/assets/vendor/supabase.js';

let _vendorPromise = null;
function loadVendor() {
  if (_vendorPromise) return _vendorPromise;
  _vendorPromise = new Promise((resolve, reject) => {
    if (window.supabase?.createClient) { resolve(window.supabase); return; }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      resolve(null);
      return;
    }
    const tag = document.createElement('script');
    tag.src = VENDOR_URL;
    tag.async = true;
    tag.onload = () => resolve(window.supabase?.createClient ? window.supabase : null);
    tag.onerror = () => reject(new Error('Failed to load supabase'));
    document.head.appendChild(tag);
  });
  return _vendorPromise;
}

let _client = null;
export async function getClient() {
  if (_client) return _client;
  const lib = await loadVendor();
  if (!lib) return null;
  _client = lib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: 'fenlo.auth' },
  });
  return _client;
}

export async function signInWithGoogle() {
  const c = await getClient();
  if (!c) throw new Error('Auth not configured — set Supabase keys in your environment');
  const { error } = await c.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname, queryParams: { prompt: 'select_account' } },
  });
  if (error) throw error;
}

export async function signOut() {
  const c = await getClient();
  if (!c) return;
  const { error } = await c.auth.signOut();
  if (error) throw error;
}

export async function currentUser() {
  const c = await getClient();
  if (!c) return null;
  const { data: { session } } = await c.auth.getSession();
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Student',
    avatar: u.user_metadata?.avatar_url || null,
  };
}

export function onAuthChange(cb) {
  getClient().then((c) => {
    if (!c) return;
    c.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      cb(u ? {
        id: u.id,
        email: u.email,
        name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Student',
        avatar: u.user_metadata?.avatar_url || null,
      } : null);
    });
  });
}
