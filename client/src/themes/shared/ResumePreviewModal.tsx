import { useEffect, useMemo, useState } from 'react';
import { Download, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { DialogRoot, DialogContent } from '@/components/ui/Dialog';
import { publicApi, adminApi } from '@/api';
import { usePortfolioData, usePortfolioPreview } from '@/context/PortfolioContext';
import { cn } from '@/lib/utils';

function isDocxResume(resumeUrl?: string) {
  return Boolean(resumeUrl?.toLowerCase().endsWith('.docx'));
}

/** Chrome/Edge/Firefox PDF viewer: open at page 1, fit entire page in the frame. */
function pdfPageFitUrl(url: string) {
  const base = url.split('#')[0];
  return `${base}#page=1&view=Fit&zoom=page-fit`;
}

/** Resolve inline/download resume URLs for public vs owner preview. */
export function useResumeUrls(slug: string) {
  const isPreview = usePortfolioPreview();
  const { profile } = usePortfolioData();
  const profileId = profile?.id;

  if (isPreview && profileId) {
    return {
      viewUrl: adminApi.getResumeUrl(profileId),
      downloadUrl: adminApi.getResumeUrl(profileId, true),
    };
  }
  return {
    viewUrl: publicApi.getResumeUrl(slug),
    downloadUrl: publicApi.getResumeUrl(slug, true),
  };
}

type ResumePreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewUrl: string;
  downloadUrl: string;
  /** Stored resume path — used to detect DOCX (browsers can't embed Word) */
  resumeUrl?: string;
  title?: string;
};

export function ResumePreviewModal({
  open,
  onOpenChange,
  viewUrl,
  downloadUrl,
  resumeUrl,
  title = 'Resume',
}: ResumePreviewModalProps) {
  const docx = isDocxResume(resumeUrl);
  const [loading, setLoading] = useState(true);
  const embedUrl = useMemo(() => pdfPageFitUrl(viewUrl), [viewUrl]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
  }, [open, embedUrl]);

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={title}
        className="max-w-4xl w-[calc(100%-1rem)] sm:w-[calc(100%-1.5rem)] p-4 sm:p-5 h-[min(94vh,920px)] max-h-[94vh] flex flex-col overflow-hidden"
      >
        <div className="flex flex-wrap items-center gap-2 mb-3 -mt-1 shrink-0">
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-accent/40 hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </a>
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-muted/40 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:border-accent/40 hover:bg-muted"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in new tab
          </a>
        </div>

        <div
          className={cn(
            'relative flex-1 min-h-0 rounded-xl border border-border/60 bg-neutral-900/40 overflow-hidden',
            docx && 'flex items-center justify-center'
          )}
        >
          {docx ? (
            <div className="flex flex-col items-center gap-4 px-6 py-10 text-center max-w-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Word document</p>
                <p className="mt-1.5 text-sm text-subtle leading-relaxed">
                  This resume is a DOCX file, which browsers can&apos;t preview inline. Download it or open it in a
                  new tab.
                </p>
              </div>
              <a
                href={downloadUrl}
                download
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Download resume
              </a>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-elevated/80 backdrop-blur-sm">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                  <p className="text-sm text-subtle">Loading resume…</p>
                </div>
              ) : null}
              <iframe
                key={embedUrl}
                title={`${title} preview`}
                src={embedUrl}
                className="absolute inset-0 h-full w-full border-0 bg-neutral-200"
                onLoad={() => setLoading(false)}
              />
            </>
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
