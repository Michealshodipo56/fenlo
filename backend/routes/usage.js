import { Router } from 'express';
import { hasDb } from '../lib/db.js';
import { getUsage, setPlan } from '../lib/usage.js';
import { requireUser } from '../lib/user.js';

const router = Router();

router.get('/', requireUser, async (req, res) => {
  try {
    if (!hasDb()) {
      return res.json({ count: 0, plan: 'free', limit: 10, remaining: 10, db: false });
    }
    const usage = await getUsage(req.userId);
    res.json({ ...usage, db: true });
  } catch (err) {
    console.error('usage error:', err);
    res.status(500).json({ error: err.message || 'Failed to load usage' });
  }
});

router.post('/plan', requireUser, async (req, res) => {
  try {
    if (!hasDb()) {
      return res.status(503).json({ error: 'Database not configured' });
    }
    const { plan } = req.body || {};
    if (!['free', 'student', 'pro'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }
    const usage = await setPlan(req.userId, plan);
    res.json(usage);
  } catch (err) {
    console.error('set plan error:', err);
    res.status(500).json({ error: err.message || 'Failed to update plan' });
  }
});

export default router;
