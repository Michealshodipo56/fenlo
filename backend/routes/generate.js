import { Router } from 'express';
import { generateContent } from '../lib/ai.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { text, mode = 'full' } = req.body || {};

    if (!text?.trim()) {
      return res.status(400).json({ error: 'Assignment text is required' });
    }
    if (!['full', 'direct'].includes(mode)) {
      return res.status(400).json({ error: 'Invalid mode' });
    }

    const content = await generateContent({ text: text.trim(), mode });
    res.json({ content, mode });
  } catch (err) {
    console.error('generate error:', err);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

export default router;
