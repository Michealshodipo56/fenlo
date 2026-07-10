#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'public', 'assets', 'css');

const CRITICAL = [
  'base/tokens.css',
  'base/reset.css',
  'base/animations.css',
  'fonts.css',
  'components/topbar.css',
  'components/buttons.css',
  'components/cards.css',
  'components/breadcrumbs.css',
  'components/footer.css',
  'pages/home.css',
];

const ORDER = [
  'fonts.css',
  'base/tokens.css',
  'base/reset.css',
  'base/animations.css',
  'components/topbar.css',
  'components/user-menu.css',
  'components/breadcrumbs.css',
  'components/buttons.css',
  'components/cards.css',
  'components/search.css',
  'components/tabs.css',
  'components/login-wall.css',
  'components/download-modal.css',
  'components/toast.css',
  'components/footer.css',
  'pages/home.css',
  'pages/submit.css',
  'pages/result.css',
  'pages/history.css',
  'pages/pricing.css',
];

const CRITICAL_SET = new Set(CRITICAL);
const REST = ORDER.filter((src) => !CRITICAL_SET.has(src));

async function concat(sources) {
  const parts = [];
  for (const rel of sources) {
    const body = await readFile(join(ROOT, rel), 'utf8');
    parts.push(`\n/* ==== ${rel} ==== */\n${body}`);
  }
  return parts.join('');
}

async function build() {
  const full = await concat(ORDER);
  await writeFile(join(ROOT, 'main.css'), full, 'utf8');

  const critical = await concat(CRITICAL);
  await writeFile(join(ROOT, 'main-critical.css'), critical, 'utf8');

  const rest = await concat(REST);
  await writeFile(join(ROOT, 'main-rest.css'), rest, 'utf8');

  console.log(`built main.css (${full.length} bytes)`);
  console.log(`built main-critical.css (${critical.length} bytes)`);
  console.log(`built main-rest.css (${rest.length} bytes)`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
