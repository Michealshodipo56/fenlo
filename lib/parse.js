import mammoth from 'mammoth';

export async function parseUploadedFile(buffer, filename, mimeType) {
  const ext = (filename || '').split('.').pop()?.toLowerCase();

  if (ext === 'txt' || mimeType === 'text/plain') {
    return buffer.toString('utf8');
  }

  if (ext === 'docx' || mimeType?.includes('wordprocessingml')) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text || '';
  }

  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext) || mimeType?.startsWith('image/')) {
    return `[Image file: ${filename}]\n\nOCR text extraction requires a cloud OCR API (e.g. Google Vision, Tesseract). For now, please paste the assignment text manually or upload a PDF/DOCX with selectable text.`;
  }

  throw new Error(`Unsupported file type: ${ext || mimeType}`);
}
