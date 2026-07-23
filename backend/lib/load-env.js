import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Load backend/.env into process.env.
 *  Values in .env win over empty/placeholder shell exports so local testing works. */
export function loadEnv() {
  const path = join(root, '.env');
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    const existing = process.env[key];
    const isPlaceholder =
      !existing ||
      /your-neon-url|your_groq|YOUR_REAL|USER:PASSWORD|ep-XXXX|gsk_\.\.\./i.test(existing);
    if (isPlaceholder) process.env[key] = val;
  }
}
