import { esc, formatDate, modeLabel, simpleMarkdownToHtml } from '../core/helpers.js';
import { topbar, footer } from '../components/topbar.js';
import { wireNav, navigate } from '../core/router.js';
import { getSubmission, persistToStorage } from '../core/state.js';
import { openExportModal } from '../components/export-modal.js';
import { API } from '../core/api.js';
import { toast } from '../core/toast.js';

const root = () => document.getElementById('app');

export function renderResult({ id }) {
  const sub = getSubmission(id);
  if (!sub) {
    const r = root();
    r.innerHTML = `${topbar('history')}<main class="nb-wrap"><div class="nb-empty"><h4>Submission not found</h4><p>This result may have been cleared from your browser.</p><button class="nb-btn" data-nav="submit" type="button">new assignment →</button></div></main>${footer()}`;
    wireNav(r);
    return;
  }

  const r = root();
  r.innerHTML = `
  ${topbar('history')}
  <main class="nb-wrap nb-result">
    <div class="nb-crumbs"><a data-nav="history" href="/history">history</a><span class="sep">/</span><span>result</span></div>
    <div class="nb-result-header">
      <div>
        <h2>${esc(sub.title)}</h2>
        <div class="nb-result-meta">
          <span class="nb-sticker ${sub.mode === 'full' ? 'g' : 'b'}">${modeLabel(sub.mode)}</span>
          <span class="nb-sticker">${formatDate(sub.createdAt)}</span>
        </div>
      </div>
    </div>

    <div class="nb-preview" id="preview">${simpleMarkdownToHtml(sub.output)}</div>

    <div class="nb-result-actions">
      <button class="nb-btn primary" type="button" id="export-btn">export →</button>
      <button class="nb-btn" type="button" id="copy-btn">copy to clipboard</button>
      <button class="nb-btn y" type="button" id="regen-btn">regenerate</button>
      <button class="nb-btn" data-nav="submit" type="button">new assignment</button>
    </div>
  </main>
  ${footer()}`;

  wireNav(r);

  document.getElementById('export-btn')?.addEventListener('click', () => {
    openExportModal({ content: sub.output, title: sub.title });
  });

  document.getElementById('copy-btn')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(sub.output);
      toast('Copied to clipboard.', 'ok');
    } catch {
      toast('Copy failed — try selecting manually', 'err');
    }
  });

  document.getElementById('regen-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('regen-btn');
    btn.disabled = true;
    btn.textContent = 'regenerating…';
    try {
      const res = await API.generate({ text: sub.input, mode: sub.mode });
      sub.output = res.content;
      persistToStorage();
      document.getElementById('preview').innerHTML = simpleMarkdownToHtml(sub.output);
      toast('Regenerated.', 'ok');
    } catch (err) {
      toast(err.message || 'Regeneration failed', 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = 'regenerate';
    }
  });
}
