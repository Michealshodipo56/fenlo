import { esc, formatDate, modeLabel } from '../core/helpers.js';
import { topbar, footer } from '../components/topbar.js';
import { wireNav, navigate } from '../core/router.js';
import { state, setSubmissions } from '../core/state.js';
import { API } from '../core/api.js';
import { toast } from '../core/toast.js';

const root = () => document.getElementById('app');

export async function renderHistory() {
  const r = root();
  r.innerHTML = `${topbar('history')}<main class="nb-wrap nb-history"><p style="font-family:var(--mono);font-size:13px;color:var(--ink-3);padding:40px 0;text-align:center">loading history…</p></main>${footer()}`;
  wireNav(r);

  try {
    const res = await API.getSubmissions();
    setSubmissions(res.submissions || []);
  } catch (err) {
    toast(err.message || 'Failed to load history', 'err');
  }

  const subs = state.submissions;

  r.innerHTML = `
  ${topbar('history')}
  <main class="nb-wrap nb-history">
    <div class="nb-crumbs"><a data-nav="home" href="/">home</a><span class="sep">/</span><span>history</span></div>
    <div class="nb-sh" style="margin-top:24px">
      <h2>Your <em>submissions</em></h2>
      ${subs.length ? `<a class="more" data-nav="submit">new →</a>` : ''}
    </div>

    ${subs.length ? `
    <div class="nb-history-list">
      ${subs.map((s) => `
        <div class="nb-history-item" data-result-id="${esc(s.id)}" role="button" tabindex="0">
          <div>
            <h4>${esc(s.title)}</h4>
            <div class="meta">
              <span>${modeLabel(s.mode)}</span>
              <span>${formatDate(s.createdAt)}</span>
              ${s.fileName ? `<span>📎 ${esc(s.fileName)}</span>` : ''}
            </div>
          </div>
          <span class="go">open →</span>
        </div>
      `).join('')}
    </div>` : `
    <div class="nb-empty">
      <h4>No submissions yet</h4>
      <p>Your completed assignments will appear here. Start with your first one.</p>
      <button class="nb-btn primary" data-nav="submit" type="button">submit assignment →</button>
    </div>`}
  </main>
  ${footer()}`;

  wireNav(r);

  r.querySelectorAll('[data-result-id]').forEach((el) => {
    const open = () => navigate('result', { id: el.dataset.resultId });
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}
