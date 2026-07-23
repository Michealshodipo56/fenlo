import { Router } from 'express';
import { listSubmissions, getSubmission, updateSubmissionOutput } from '../lib/submissions.js';
import { canGenerate, incrementUsage } from '../lib/usage.js';
import { generateContent } from '../lib/ai.js';
import { requireUser } from '../lib/user.js';

const router = Router();

router.get('/', requireUser, async (req, res) => {
  try {
    const submissions = await listSubmissions(req.userId);
    res.json({ submissions });
  } catch (err) {
    console.error('list submissions error:', err);
    res.status(500).json({ error: err.message || 'Failed to load history' });
  }
});

router.get('/:id', requireUser, async (req, res) => {
  try {
    const submission = await getSubmission(req.userId, req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    res.json({ submission });
  } catch (err) {
    console.error('get submission error:', err);
    res.status(500).json({ error: err.message || 'Failed to load submission' });
  }
});

router.post('/:id/regenerate', requireUser, async (req, res) => {
  try {
    const submission = await getSubmission(req.userId, req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const gate = await canGenerate(req.userId);
    if (!gate.allowed) {
      return res.status(429).json({ error: gate.error, usage: gate.usage });
    }

    const content = await generateContent({ text: submission.input, mode: submission.mode });
    const updated = await updateSubmissionOutput(req.userId, submission.id, content);
    const usage = await incrementUsage(req.userId);

    res.json({ content, submission: updated, usage });
  } catch (err) {
    console.error('regenerate error:', err);
    res.status(500).json({ error: err.message || 'Regeneration failed' });
  }
});

export default router;
