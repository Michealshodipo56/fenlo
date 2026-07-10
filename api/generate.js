import { json, getOrigin, corsHeaders } from '../lib/http.js';
import { generateContent } from '../lib/ai.js';

export const config = { maxDuration: 60 };

export default async function handler(req) {
  const origin = getOrigin(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' }, origin);

  try {
    const body = await req.json();
    const { text, mode = 'full' } = body;

    if (!text?.trim()) {
      return json(400, { error: 'Assignment text is required' }, origin);
    }

    if (!['full', 'direct'].includes(mode)) {
      return json(400, { error: 'Invalid mode' }, origin);
    }

    const content = await generateContent({ text: text.trim(), mode });
    return json(200, { content, mode }, origin);
  } catch (err) {
    console.error('generate error:', err);
    return json(500, { error: err.message || 'Generation failed' }, origin);
  }
}
