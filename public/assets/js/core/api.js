import { toast } from './toast.js';

async function request(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      ...(opts.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...opts.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const API = {
  async generate({ text, mode, fileText, fileName }) {
    return request('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ text, mode, fileText, fileName }),
    });
  },

  async parseFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    return request('/api/parse', { method: 'POST', body: fd });
  },

  async exportResult({ content, title, format }) {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
