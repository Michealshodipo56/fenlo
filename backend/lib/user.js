export function resolveUserId(req) {
  const header = req.headers['x-fenlo-user-id'];
  if (typeof header === 'string' && header.trim()) {
    return header.trim().slice(0, 128);
  }
  return null;
}

export function requireUser(req, res, next) {
  const userId = resolveUserId(req);
  if (!userId) {
    return res.status(400).json({ error: 'Missing X-Fenlo-User-Id header' });
  }
  req.userId = userId;
  next();
}
