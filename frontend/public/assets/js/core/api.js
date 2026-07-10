import { toast } from './toast.js';
import { API_BASE } from './config.js';
import { getUserId } from './user.js';

function apiUrl(path) {
  const base = API_BASE || window.__FENLO_API_URL__ || '';
  return `${base}${path}`;
}

function authHeaders(extra = {}) {
  return {
    'X-Fenlo-User-Id': getUserId(),
    ...extra,
  };
}

async function request(path, opts = {}) {
  const res = await fetch(apiUrl(path), {
    ...opts,
    credentials: 'include',
    headers: {
      ...authHeaders(),
      ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...opts.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const API = {
  async getUsage() {
    return request('/api/usage');
  },

  async getSubmissions() {
    return request('/api/submissions');
  },

  async getSubmission(id) {
    return request(`/api/submissions/${encodeURIComponent(id)}`);
  },

  async generate({ text, mode, fileText, fileName }) {
    return request('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ text, mode, fileText, fileName }),
    });
  },

  async regenerate(id) {
    return request(`/api/submissions/${encodeURIComponent(id)}/regenerate`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  async setPlan(plan) {
    return request('/api/usage/plan', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });
  },

  async parseFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    return request('/api/parse', { method: 'POST', body: fd });
  },

  async exportResult({ content, title, format }) {
    const res = await fetch(apiUrl('/api/export'), {
      method: 'POST',
      credentials: 'include',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ content, title, format }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Export failed');
    }
    return res.blob();
  },
};

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  toast('Download started.', 'ok');
}

export function applyUsage(usage) {
  if (!usage) return;
  window.dispatchEvent(new CustomEvent('fenlo:usage', { detail: usage }));
}
