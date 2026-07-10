import { getOrigin } from '../lib/http.js';
import { exportPdf, exportDocx, exportTxt, exportMd } from '../lib/export.js';

export const config = { maxDuration: 30 };

export default async function handler(req) {
  const origin = getOrigin(req);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { content, title, format = 'pdf' } = await req.json();
    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    let buffer;
    let contentType;
    let filename;

    switch (format) {
      case 'docx':
        buffer = await exportDocx({ content, title });
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = 'fenlo-assignment.docx';
        break;
      case 'txt':
        buffer = exportTxt({ content });
        contentType = 'text/plain';
        filename = 'fenlo-assignment.txt';
        break;
      case 'md':
        buffer = exportMd({ content });
        contentType = 'text/markdown';
        filename = 'fenlo-assignment.md';
        break;
      default:
        buffer = await exportPdf({ content, title });
        contentType = 'application/pdf';
        filename = 'fenlo-assignment.pdf';
    }

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': origin || '*',
      },
    });
  } catch (err) {
    console.error('export error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Export failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
