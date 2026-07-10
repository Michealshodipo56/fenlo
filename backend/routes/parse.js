import { Router } from 'express';
import multer from 'multer';
import { parseUploadedFile } from '../lib/parse.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const text = await parseUploadedFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    if (!text.trim()) {
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    res.json({ text, filename: req.file.originalname });
  } catch (err) {
    console.error('parse error:', err);
    res.status(500).json({ error: err.message || 'Parse failed' });
  }
});

export default router;
