import { esc } from '../core/helpers.js';
import { topbar, footer } from '../components/topbar.js';
import { wireNav, navigate } from '../core/router.js';
import { state } from '../core/state.js';

const root = () => document.getElementById('app');

export function renderHome() {
  const r = root();
  const remaining = state.plan === 'free' ? state.usageLimit - state.usageCount : '∞';

  r.innerHTML = `
  ${topbar('home')}
  <section class="nb-hero">
    <h1>Upload your assignment — get a <em>polished</em> <mark class="hl">answer</mark> back, <em>built like a notebook,</em> <mark class="hl g">fast like an app</mark>.</h1>
    <div class="nb-hero-cta">
      <button class="nb-btn primary" data-nav="submit" type="button">start new assignment →</button>
      <button class="nb-btn" data-nav="history" type="button">view history</button>
    </div>
    <div class="nb-stats">
      <div>output modes<strong>2</strong></div>
      <div>export formats<strong><em>4</em></strong></div>
      <div>avg turnaround<strong>&lt;60s</strong></div>
      <div>free tier<strong>${remaining}<span style="font-size:14px;font-weight:600"> left</span></strong></div>
    </div>
  </section>

  <main class="nb-wrap">
    <div class="nb-sh"><h2>How it <em>works</em></h2></div>
    <div class="nb-steps">
      <div class="nb-step"><div class="n">01</div><h4>Submit</h4><p>Paste your assignment instructions or upload a PDF, DOCX, or image. We extract the text automatically.</p></div>
      <div class="nb-step"><div class="n">02</div><h4>Choose output</h4><p>Pick <strong>Full Assignment</strong> for a formatted essay/report, or <strong>Direct Answer</strong> for a concise solution.</p></div>
      <div class="nb-step"><div class="n">03</div><h4>Download</h4><p>Preview the result in-app, then export as PDF, Word, TXT, or Markdown — ready to submit or study from.</p></div>
    </div>

    <div class="nb-sh"><h2>Built for <em>students</em></h2><span class="caption">— essays, reports, code, problem sets</span></div>
    <div class="nb-feature-grid">
      <div class="nb-card mint flat">
        <span class="nb-sticker g">full assignment</span>
        <h3>Formatted like a submission</h3>
        <p>Structured essays with intro, body, conclusion. Lab reports with headers. Code assignments with comments. Citations where needed.</p>
      </div>
      <div class="nb-card sky flat">
        <span class="nb-sticker b">direct answer</span>
        <h3>Just the solution</h3>
        <p>Concise answers, step-by-step math, code snippets, or bullet-point summaries — no fluff, no filler paragraphs.</p>
      </div>
      <div class="nb-card yellow flat">
        <span class="nb-sticker y">file upload</span>
        <h3>PDF, DOCX & images</h3>
        <p>Drop your assignment file and we parse it. Scanned pages and photos are handled with OCR text extraction.</p>
      </div>
      <div class="nb-card blush flat">
        <span class="nb-sticker p">export</span>
        <h3>Your format, your file</h3>
        <p>Download as PDF for printing, DOCX for editing, TXT for simplicity, or Markdown for your notes app.</p>
      </div>
    </div>

    <div class="nb-callout warn" style="margin-top:32px">
      <div class="ic">!</div>
      <div>
        <h5>Academic integrity</h5>
        <p>Fenlo is designed as a <strong>study and learning aid</strong>. Use generated content to understand concepts — not to misrepresent work as your own. Most institutions prohibit submitting AI-generated assignments.</p>
      </div>
    </div>
  </main>
  ${footer()}`;

  wireNav(r);
}
