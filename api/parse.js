import { json, getOrigin } from '../lib/http.js';
import { parseUploadedFile } from '../lib/parse.js';

export const config = { maxDuration: 30 };

export default async function handler(req) {
  const origin = getOrigin(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' }, origin);

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return json(400, { error: 'No file uploaded' }, origin);

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await parseUploadedFile(buffer, file.name, file.type);

    if (!text.trim()) {
      return json(400, { error: 'Could not extract text from file' }, origin);
    }

    return json(200, { text, filename: file.name }, origin);
  } catch (err) {
    console.error('parse error:', err);
    return json(500, { error: err.message || 'Parse failed' }, origin);
  }
}
