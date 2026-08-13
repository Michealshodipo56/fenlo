#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from './load-env.mjs';

loadEnv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const PRODUCTION_URL = 'https://fenlo.vercel.app';

function normalizeSiteUrl(url) {
  let u = String(url || '').trim().replace(/\/$/, '');
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
  return u;
}

function resolveSiteUrl() {
  if (process.env.SITE_URL && !/localhost|127\.0\.0\.1/i.test(process.env.SITE_URL)) {
    return normalizeSiteUrl(process.env.SITE_URL);
  }
  if (process.env.VERCEL === '1' || process.env.VERCEL_URL) {
    return PRODUCTION_URL;
  }
  return 'http://localhost:3000';
}

const BASE = resolveSiteUrl();
const today = new Date().toISOString().slice(0, 10);

const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/submit', priority: '0.9', changefreq: 'weekly' },
  { path: '/history', priority: '0.7', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
];

function urlNode({ path, priority, changefreq }) {
  const loc = path === '/' ? `${BASE}/` : `${BASE}${path}`;
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(urlNode).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${BASE}/sitemap.xml
`;

await writeFile(join(publicDir, 'sitemap.xml'), xml, 'utf8');
await writeFile(join(publicDir, 'robots.txt'), robots, 'utf8');
console.log(`built sitemap.xml + robots.txt for ${BASE}`);
