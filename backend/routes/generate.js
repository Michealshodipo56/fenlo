import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { generateContent } from '../lib/ai.js';
import { hasDb } from '../lib/db.js';
import { canGenerate, incrementUsage } from '../lib/usage.js';
import { createSubmission, truncateTitle } from '../lib/submissions.js';
import { requireUser } from '../lib/user.js';

const router = Router();

router.post('/', requireUser, async (req, res) => {
  try {
    if (!hasDb()) {
      return res.status(503).json({ error: 'Database not configured — set DATABASE_URL on Render' });
    }

    const { text, mode = 'full', fileName } = req.body || {};
    const userId = req.userId;

    if (!text?.trim()) {
      return res.status(400).json({ error: 'Assignment text is required' });
    }
    if (!['full', 'direct'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    const gate = await canGenerate(userId);
    if (!gate.allowed) {
      return res.status(429).json({ error: gate.error, usage: gate.usage });
    }

    const content = await generateContent({ text: text.trim(), mode });
    const id = randomUUID();
    const title = truncateTitle(text);

    const submission = await createSubmission({
      id,
      userId,
      title,
      input: text.trim(),
      output: content,
      mode,
      fileName: fileName || null,
    });

    const usage = await incrementUsage(userId);

    res.json({ content, mode, submission, usage });
  } catch (err) {
    console.error('generate error:', err);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

export default router;
