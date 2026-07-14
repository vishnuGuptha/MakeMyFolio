import path from 'path';
import { createRequire } from 'module';
import mammoth from 'mammoth';
import { AppError } from '../utils/errors.js';

const require = createRequire(import.meta.url);

/** ~12k tokens — keeps Gemini input cost low */
const MAX_TEXT_LENGTH = 50_000;

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

type PdfParseFn = (buffer: Buffer) => Promise<{ text: string }>;

async function parsePdfText(buffer: Buffer): Promise<string> {
  // Import lib directly — pdf-parse/index.js runs broken debug code on load
  const pdfParse = require('pdf-parse/lib/pdf-parse.js') as PdfParseFn;
  const parsed = await pdfParse(buffer);
  return parsed.text || '';
}

export function isResumeFile(mimetype: string, originalname: string): boolean {
  const ext = path.extname(originalname).toLowerCase();
  return (
    mimetype === 'application/pdf' ||
    ext === '.pdf' ||
    mimetype === DOCX_MIME ||
    ext === '.docx'
  );
}

export function getResumeExtension(mimetype: string, originalname: string): '.pdf' | '.docx' {
  const ext = path.extname(originalname).toLowerCase();
  if (ext === '.docx' || mimetype === DOCX_MIME) return '.docx';
  return '.pdf';
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extractRawTextFromResume(
  buffer: Buffer,
  mimetype: string,
  originalname: string
): Promise<string> {
  const ext = originalname.toLowerCase();
  let text = '';

  if (mimetype === 'application/pdf' || ext.endsWith('.pdf')) {
    try {
      text = await parsePdfText(buffer);
    } catch {
      throw new AppError('Failed to extract text from PDF. Try a text-based PDF or DOCX.', 400);
    }
  } else if (mimetype === DOCX_MIME || ext.endsWith('.docx')) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || '';
    } catch {
      throw new AppError('Failed to extract text from DOCX.', 400);
    }
  } else {
    throw new AppError('Only PDF and DOCX files are supported', 400);
  }

  text = normalizeText(text);
  if (!text || text.length < 50) {
    throw new AppError(
      'Could not extract enough text from resume. Use a text-based PDF or DOCX file.',
      400
    );
  }

  if (text.length > MAX_TEXT_LENGTH) {
    console.warn(`[resume-text] Truncating ${text.length} chars to ${MAX_TEXT_LENGTH}`);
    text = text.slice(0, MAX_TEXT_LENGTH);
  }

  return text;
}
