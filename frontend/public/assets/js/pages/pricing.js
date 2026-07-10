import { topbar, footer } from '../components/topbar.js';
import { wireNav } from '../core/router.js';
import { state, persistToStorage } from '../core/state.js';
import { toast } from '../core/toast.js';

const root = () => document.getElementById('app');

export function renderPricing() {
  const r = root();

  r.innerHTML = `
  ${topbar('pricing')}
  <main class="nb-wrap nb-pricing">
    <div class="nb-crumbs"><a data-nav="home" href="/">home</a><span class="sep">/</span><span>pricing</span></div>
    <div class="nb-sh" style="margin-top:24px"><h2>Simple <em>pricing</em></h2><span class="caption">— no hidden fees</span></div>

    <div class="nb-plans">
      <div class="nb-plan">
        <h3>Free</h3>
        <div class="price">₦0 <span>/ month</span></div>
        <ul>
          <li>5 submissions per month</li>
          <li>Text & file upload</li>
          <li>PDF & DOCX export</li>
          <li>Local history</li>
        </ul>
        <button class="nb-btn" data-plan="free" type="button" ${state.plan === 'free' ? 'disabled' : ''}>${state.plan === 'free' ? 'current plan' : 'downgrade'}</button>
      </div>

      <div class="nb-plan featured">
        <span class="tag">popular</span>
        <h3>Student</h3>
        <div class="price">₦2,500 <span>/ month</span></div>
        <ul>
          <li>50 submissions per month</li>
          <li>Priority processing</li>
          <li>All export formats</li>
          <li>Cloud history sync</li>
          <li>Email support</li>
        </ul>
        <button class="nb-btn primary" data-plan="student" type="button">upgrade →</button>
      </div>

      <div class="nb-plan">
        <h3>Pro</h3>
        <div class="price">₦5,000 <span>/ month</span></div>
        <ul>
          <li>Unlimited submissions</li>
          <li>Fastest processing</li>
          <li>All export formats</li>
          <li>Cloud history sync</li>
          <li>Priority support</li>
        </ul>
        <button class="nb-btn" data-plan="pro" type="button">upgrade →</button>
      </div>
    </div>

    <div class="nb-callout info" style="margin-top:32px">
      <div class="ic">i</div>
      <div>
        <h5>Payment coming soon</h5>
        <p>Stripe / Paystack integration is on the roadmap. For now, clicking upgrade activates a <strong>demo plan</strong> so you can test the full experience.</p>
      </div>
    </div>
  </main>
  ${footer()}`;

  wireNav(r);

  r.querySelectorAll('[data-plan]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const plan = btn.dataset.plan;
      state.plan = plan;
      if (plan === 'free') state.usageLimit = 5;
      else if (plan === 'student') state.usageLimit = 50;
      else state.usageLimit = 9999;
      persistToStorage();
      toast(`Switched to ${plan} plan (demo).`, 'ok');
      renderPricing();
    });
  });
}
