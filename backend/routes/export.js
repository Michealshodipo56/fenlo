import { Router } from 'express';
import { exportPdf, exportDocx, exportTxt, exportMd } from '../lib/export.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { content, title, format = 'pdf' } = req.body || {};
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
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

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    console.error('export error:', err);
    res.status(500).json({ error: err.message || 'Export failed' });
  }
});

export default router;
