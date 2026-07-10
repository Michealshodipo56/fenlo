import { esc } from '../core/helpers.js';
import { topbar, footer } from '../components/topbar.js';
import { wireNav, navigate } from '../core/router.js';
import { state, canSubmit, addSubmission } from '../core/state.js';
import { API } from '../core/api.js';
import { toast } from '../core/toast.js';
import { uid } from '../core/helpers.js';

const root = () => document.getElementById('app');
let uploadedFile = null;
let parsedFileText = '';

export function renderSubmit() {
  if (!canSubmit()) {
    renderPaywall();
    return;
  }

  const r = root();
  r.innerHTML = `
  ${topbar('submit')}
  <main class="nb-wrap nb-submit">
    <div class="nb-crumbs"><a data-nav="home" href="/">home</a><span class="sep">/</span><span>new assignment</span></div>
    <div class="nb-sh" style="margin-top:24px"><h2>New <em>assignment</em></h2></div>

    <form id="submit-form" class="nb-submit-grid">
      <div>
        <div class="nb-card flat">
          <h3>Assignment instructions</h3>
          <p>Paste the full assignment prompt, question, or task description below.</p>
          <textarea class="nb-input-area" id="assignment-text" placeholder="e.g. Write a 1500-word essay on the causes of the French Revolution. Include at least 3 primary sources…" required></textarea>
        </div>

        <div class="nb-card flat" style="margin-top:14px">
          <h3>Or upload a file</h3>
          <label class="nb-upload-zone" id="upload-zone">
            <input type="file" id="file-input" accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp,.txt">
            <div class="ic">📎</div>
            <h4>Drop file here or click to browse</h4>
            <p>PDF · DOCX · PNG · JPG · TXT — max 10 MB</p>
          </label>
          <div id="file-chip"></div>
        </div>
      </div>

      <aside>
        <div class="nb-sidebar-card">
          <h4>Output mode</h4>
          <fieldset class="nb-mode-picker">
            <legend class="sr-only">Choose output mode</legend>
            <label class="nb-mode-opt">
              <input type="radio" name="mode" value="full" checked>
              <span class="t"><b>Full Assignment</b><em>Formatted essay, report, or structured submission with headers and citations.</em></span>
            </label>
            <label class="nb-mode-opt">
              <input type="radio" name="mode" value="direct">
              <span class="t"><b>Direct Answer</b><em>Concise solution only — no filler, no essay structure.</em></span>
            </label>
          </fieldset>

          <div class="nb-submit-actions">
            <button class="nb-btn primary" type="submit" id="submit-btn">generate →</button>
          </div>
          <p class="muted" style="margin-top:12px;font-family:var(--mono);font-size:11px">
            ${state.plan === 'free' ? `${state.usageLimit - state.usageCount} free submissions remaining` : 'Unlimited on your plan'}
          </p>
        </div>
      </aside>
    </form>
  </main>
  ${footer()}`;

  wireNav(r);
  setupUpload();
  setupForm();
}

function setupUpload() {
  const zone = document.getElementById('upload-zone');
  const input = document.getElementById('file-input');
  const chip = document.getElementById('file-chip');

  zone?.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone?.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone?.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer?.files?.[0]) handleFile(e.dataTransfer.files[0]);
  });
  input?.addEventListener('change', () => { if (input.files?.[0]) handleFile(input.files[0]); });

  async function handleFile(file) {
    if (file.size > 10 * 1024 * 1024) { toast('File too large — max 10 MB', 'err'); return; }
    uploadedFile = file;
    chip.innerHTML = `<div class="nb-file-chip"><span class="name">${esc(file.name)}</span><button type="button" id="remove-file">remove</button></div>`;
    document.getElementById('remove-file')?.addEventListener('click', () => {
      uploadedFile = null;
      parsedFileText = '';
      chip.innerHTML = '';
      input.value = '';
    });
    try {
      toast('Parsing file…');
      const res = await API.parseFile(file);
      parsedFileText = res.text || '';
      toast('File parsed.', 'ok');
    } catch (err) {
      toast(err.message || 'Failed to parse file', 'err');
    }
  }
}

function setupForm() {
  document.getElementById('submit-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = document.getElementById('assignment-text')?.value?.trim();
    const mode = document.querySelector('[name="mode"]:checked')?.value || 'full';
    const combined = [text, parsedFileText].filter(Boolean).join('\n\n---\n\n');
    if (!combined) { toast('Please enter assignment text or upload a file', 'err'); return; }

    renderProcessing();
    try {
      const res = await API.generate({ text: combined, mode, fileText: parsedFileText, fileName: uploadedFile?.name });
      const sub = {
        id: uid(),
        title: truncateTitle(combined),
        input: combined,
        output: res.content,
        mode,
        createdAt: new Date().toISOString(),
        fileName: uploadedFile?.name || null,
      };
      addSubmission(sub);
      navigate('result', { id: sub.id });
    } catch (err) {
      toast(err.message || 'Generation failed', 'err');
      renderSubmit();
    }
  });
}

function truncateTitle(s) {
  const line = s.split('\n')[0];
  return line.length > 60 ? line.slice(0, 60) + '…' : line;
}

function renderProcessing() {
  const r = root();
  r.innerHTML = `
  ${topbar('submit')}
  <main class="nb-wrap nb-submit">
    <div class="nb-card flat">
      <div class="nb-processing">
        <div class="spinner" aria-hidden="true"></div>
        <h3>Processing your assignment</h3>
        <p>Parsing instructions, classifying task type, and generating your ${document.querySelector('[name="mode"]:checked')?.value === 'direct' ? 'answer' : 'assignment'}…</p>
      </div>
    </div>
  </main>`;
}

function renderPaywall() {
  const r = root();
  r.innerHTML = `
  ${topbar('submit')}
  <main class="nb-wrap nb-submit">
    <div class="nb-empty">
      <h4>Free tier limit reached</h4>
      <p>You've used all ${state.usageLimit} free submissions this month. Upgrade to keep going.</p>
      <button class="nb-btn primary" data-nav="pricing" type="button">view plans →</button>
    </div>
  </main>
  ${footer()}`;
  wireNav(r);
}
