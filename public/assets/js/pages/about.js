import { topbar, footer } from '../components/topbar.js';
import { wireNav } from '../core/router.js';

const root = () => document.getElementById('app');

export function renderAbout() {
  const r = root();
  r.innerHTML = `
  ${topbar('about')}
  <main class="nb-wrap" style="padding:32px 0 60px">
    <div class="nb-crumbs"><a data-nav="home" href="/">home</a><span class="sep">/</span><span>about</span></div>
    <div class="nb-sh" style="margin-top:24px"><h2>About <em>Fenlo</em></h2></div>

    <p class="nb-lede">Fenlo is an AI assignment completion platform for students who need fast, formatted help with coursework — essays, reports, code, and problem sets.</p>

    <div class="nb-card flat">
      <h3>What Fenlo does</h3>
      <p>You upload or paste an assignment. Choose whether you want a full written submission or a direct answer. Fenlo processes it with AI and returns a result you can preview, copy, or download in PDF, Word, TXT, or Markdown.</p>
    </div>

    <div class="nb-card mint flat">
      <h3>For learning, not cheating</h3>
      <p>We position Fenlo as a study aid. Use it to understand how to approach a problem, see example structure, or check your work — not to submit AI output as your own. Academic integrity policies at most institutions prohibit the latter.</p>
    </div>

    <div class="nb-card sky flat">
      <h3>Built by students</h3>
      <p>Fenlo was created for university and college students juggling heavy course loads, part-time work, and tight deadlines — starting with the Nigerian and African student market.</p>
    </div>

    <div class="nb-sh"><h2>Contact</h2></div>
    <p style="font-family:var(--mono);font-size:13px;color:var(--ink-2)">Micheal Shodipo · <a href="mailto:hello@fenlo.app" class="sq">hello@fenlo.app</a></p>
  </main>
  ${footer()}`;
  wireNav(r);
}
