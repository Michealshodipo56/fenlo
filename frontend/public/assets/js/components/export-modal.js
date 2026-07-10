import { API, downloadBlob } from '../core/api.js';
import { esc } from '../core/helpers.js';
import { toast } from '../core/toast.js';

export function openExportModal({ content, title }) {
  if (document.querySelector('.nb-wall.is-dl')) return;

  const w = document.createElement('div');
  w.className = 'nb-wall is-dl';
  w.setAttribute('aria-hidden', 'false');
  w.innerHTML = `
    <div class="nb-wall-card nb-dl-card" role="dialog" aria-modal="true" aria-labelledby="dl-title">
      <button class="nb-dl-close" type="button" aria-label="Close dialog">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <h3 id="dl-title">Export <em>result</em></h3>
      <p class="nb-dl-sub">${esc(title || 'assignment')}</p>
      <form class="nb-dl-form" novalidate>
        <label class="nb-dl-field">
          <span class="nb-dl-label">File name</span>
          <div class="nb-dl-input">
            <input type="text" id="dl-filename" autocomplete="off" spellcheck="false" maxlength="60" value="fenlo-assignment" required>
            <span class="nb-dl-ext" id="dl-ext">.pdf</span>
          </div>
        </label>
        <fieldset class="nb-dl-mode">
          <legend>Format</legend>
          <label class="nb-dl-radio"><input type="radio" name="dl-format" value="pdf" checked><span><b>PDF</b><em>print-ready document</em></span></label>
          <label class="nb-dl-radio"><input type="radio" name="dl-format" value="docx"><span><b>Word (DOCX)</b><em>editable in Microsoft Word</em></span></label>
          <label class="nb-dl-radio"><input type="radio" name="dl-format" value="txt"><span><b>Plain text</b><em>simple .txt file</em></span></label>
          <label class="nb-dl-radio"><input type="radio" name="dl-format" value="md"><span><b>Markdown</b><em>.md for notes apps</em></span></label>
        </fieldset>
        <div class="nb-dl-actions">
          <button class="nb-btn" type="button" data-dl-cancel>cancel</button>
          <button class="nb-btn primary" type="submit">download →</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(w);

  const close = () => w.remove();
  w.querySelector('.nb-dl-close')?.addEventListener('click', close);
  w.querySelector('[data-dl-cancel]')?.addEventListener('click', close);
  w.addEventListener('click', (e) => { if (e.target === w) close(); });

  const extEl = w.querySelector('#dl-ext');
  w.querySelectorAll('[name="dl-format"]').forEach((r) => {
    r.addEventListener('change', () => {
      const fmt = w.querySelector('[name="dl-format"]:checked')?.value || 'pdf';
      extEl.textContent = fmt === 'docx' ? '.docx' : fmt === 'md' ? '.md' : '.txt';
      if (fmt === 'pdf') extEl.textContent = '.pdf';
    });
  });

  w.querySelector('form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = w.querySelector('[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'generating…';
    try {
      const format = w.querySelector('[name="dl-format"]:checked')?.value || 'pdf';
      const name = (w.querySelector('#dl-filename')?.value || 'fenlo-assignment').replace(/[^a-z0-9-_]+/gi, '-');
      const blob = await API.exportResult({ content, title, format });
      const ext = format === 'docx' ? 'docx' : format === 'md' ? 'md' : format === 'txt' ? 'txt' : 'pdf';
      downloadBlob(blob, `${name}.${ext}`);
      close();
    } catch (err) {
      toast(err.message || 'Export failed', 'err');
      btn.disabled = false;
      btn.textContent = 'download →';
    }
  });
}
