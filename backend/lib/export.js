import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export async function exportPdf({ content, title }) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page = doc.addPage([595, 842]);
  const margin = 50;
  const maxWidth = 495;
  let y = 800;

  const lines = wrapText(content, font, 11, maxWidth);
  for (const line of lines) {
    if (y < 60) {
      page = doc.addPage([595, 842]);
      y = 800;
    }
    const isHeading = line.startsWith('#');
    const text = line.replace(/^#+\s*/, '');
    const f = isHeading ? bold : font;
    const size = isHeading ? 14 : 11;
    page.drawText(text, { x: margin, y, size, font: f, color: rgb(0.09, 0.09, 0.11) });
    y -= size + 8;
  }

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

export async function exportDocx({ content, title }) {
  const paragraphs = content.split('\n').map((line) => {
    if (line.startsWith('# ')) {
      return new Paragraph({ text: line.slice(2), heading: HeadingLevel.HEADING_1 });
    }
    if (line.startsWith('## ')) {
      return new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_2 });
    }
    if (line.startsWith('### ')) {
      return new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_3 });
    }
    return new Paragraph({ children: [new TextRun(line)] });
  });

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });
  return Packer.toBuffer(doc);
}

export function exportTxt({ content }) {
  return Buffer.from(content, 'utf8');
}

export function exportMd({ content }) {
  return Buffer.from(content, 'utf8');
}

function wrapText(text, font, size, maxWidth) {
  const result = [];
  for (const raw of text.split('\n')) {
    if (!raw.trim()) { result.push(''); continue; }
    const words = raw.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth) {
        if (line) result.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) result.push(line);
  }
  return result;
}
