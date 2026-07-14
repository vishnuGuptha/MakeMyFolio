import { ExternalLink, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Education } from '@/types';

export function isDocumentUrl(url: string) {
  return /\.(pdf|docx?|pptx?)$/i.test(url.split('?')[0] || '');
}

export function educationAttachmentHref(edu: Pick<Education, 'url' | 'imageUrl'>) {
  return (edu.url || edu.imageUrl || '').trim();
}

/** Compact public link / preview for degree docs, marksheets, screenshots */
export function EducationAttachment({
  education,
  className,
}: {
  education: Pick<Education, 'url' | 'imageUrl' | 'degree'>;
  className?: string;
}) {
  const href = educationAttachmentHref(education);
  const media = education.imageUrl?.trim() || '';
  if (!href && !media) return null;

  const isDoc = media ? isDocumentUrl(media) : false;
  const openHref = href || media;

  return (
    <div className={cn('mt-3 flex flex-wrap items-center gap-3', className)}>
      {media && !isDoc ? (
        <a href={openHref} target="_blank" rel="noopener noreferrer" className="block shrink-0">
          <img
            src={media}
            alt=""
            className="h-14 w-14 rounded-lg object-cover border border-border/60"
          />
        </a>
      ) : null}
      <a
        href={openHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
      >
        {isDoc || !media ? (
          <FileText className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        )}
        {isDoc ? 'View document' : education.url && media ? 'View credential' : 'Open attachment'}
      </a>
    </div>
  );
}
