import fs from 'fs';
import path from 'path';
import type { Response } from 'express';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

export function resolveResumeFilePath(resumeUrl: string): string | null {
  if (!resumeUrl) return null;
  const filePath = path.join(process.cwd(), resumeUrl.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) return null;
  return filePath;
}

export function deleteResumeFile(resumeUrl: string) {
  const filePath = resolveResumeFilePath(resumeUrl);
  if (filePath) fs.unlinkSync(filePath);
}

function getResumeMimeType(filePath: string): string {
  if (filePath.toLowerCase().endsWith('.docx')) return DOCX_MIME;
  return 'application/pdf';
}

export function getResumeDownloadName(slug: string, filePath: string): string {
  const ext = path.extname(filePath).toLowerCase() || '.pdf';
  return `${slug}-resume${ext}`;
}

export function sendResumeFile(res: Response, filePath: string, filename: string, download: boolean) {
  const mime = getResumeMimeType(filePath);
  const isDocx = mime === DOCX_MIME;
  res.setHeader('Content-Type', mime);

  if (download || isDocx) {
    res.download(filePath, filename);
    return;
  }

  // Allow portfolio frontends (often a different origin) to embed the PDF in a preview iframe.
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  fs.createReadStream(filePath).pipe(res);
}
