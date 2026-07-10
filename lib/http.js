export function corsHeaders(origin) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim());
  const o = allowed.includes(origin) || allowed.includes('*') ? origin : allowed[0] || '*';
  return {
    'Access-Control-Allow-Origin': o || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export function json(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

export function getOrigin(req) {
  return req.headers.get('origin') || req.headers.get('referer')?.replace(/\/[^/]*$/, '') || '';
}
