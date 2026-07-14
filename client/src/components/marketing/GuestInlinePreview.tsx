import { ExternalLink } from 'lucide-react';
import { BRAND } from '@/brand/constants';
import { guestDraftToPortfolioData, type GuestDraft } from '@/context/GuestDraftContext';
import type { PortfolioThemeId } from '@/themes/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/** Rich card preview of guest draft (side panel). */
export function GuestInlinePreview({
  draft,
  onOpenFull,
}: {
  draft: GuestDraft;
  onOpenFull: () => void;
}) {
  const data = guestDraftToPortfolioData(draft);
  const c = data.content!;
  const theme = draft.themeId as PortfolioThemeId;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-elevated shadow-glass">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <span className="truncate font-mono text-[10px] text-subtle">
          {BRAND.domain}/{data.profile.slug}
        </span>
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-secondary capitalize">
          {theme.replace('-', ' ')}
        </span>
      </div>

      <div className="relative h-36 overflow-hidden bg-muted">
        {c.profileImageUrl ? (
          <img src={c.profileImageUrl} alt="" className="h-full w-full object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 marketing-mesh" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-elevated via-elevated/80 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
          {c.profileImageUrl ? (
            <img
              src={c.profileImageUrl}
              alt=""
              className="h-16 w-16 rounded-full border-2 border-elevated object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-elevated bg-accent/20 text-lg font-bold text-accent">
              {(c.name || '?').slice(0, 1)}
            </div>
          )}
          <div className="min-w-0 pb-0.5">
            <p className="truncate text-lg font-semibold text-primary">{c.name || 'Your name'}</p>
            <p className="truncate text-sm text-accent">{c.title}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {c.tagline && <p className="text-sm text-secondary">{c.tagline}</p>}
        {c.bio && <p className="text-xs text-subtle line-clamp-3">{c.bio}</p>}

        <div className="flex flex-wrap gap-3 text-[11px] text-subtle">
          {c.location && <span>{c.location}</span>}
          {c.yearsExperience && <span>· {c.yearsExperience} yrs</span>}
          {c.email && <span className="truncate">· {c.email}</span>}
        </div>

        {data.skills.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-subtle">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.flatMap((cat) =>
                cat.skills.slice(0, 6).map((s) => (
                  <span
                    key={`${cat._id}-${s.name}`}
                    className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-secondary"
                  >
                    {s.name}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {data.experiences[0] && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-subtle">Experience</p>
            <p className="text-sm font-medium text-primary">
              {data.experiences[0].role} @ {data.experiences[0].company}
            </p>
            <p className="text-[11px] text-subtle">
              {data.experiences[0].startDate}
              {data.experiences[0].isCurrent
                ? ' — Present'
                : data.experiences[0].endDate
                  ? ` — ${data.experiences[0].endDate}`
                  : ''}
            </p>
          </div>
        )}

        {data.projects.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-subtle">Projects</p>
            <div className="grid grid-cols-2 gap-2">
              {data.projects.slice(0, 2).map((p) => (
                <div key={p._id} className="overflow-hidden rounded-lg border border-border bg-base">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt="" className="h-16 w-full object-cover" />
                  ) : (
                    <div className="flex h-16 items-center justify-center bg-muted text-[10px] text-subtle">
                      No image
                    </div>
                  )}
                  <p className="truncate px-2 py-1.5 text-[11px] font-medium text-primary">{p.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(data.education[0] || data.certifications[0]) && (
          <div className="grid gap-2 text-[11px] text-subtle sm:grid-cols-2">
            {data.education[0] && (
              <div>
                <p className="font-semibold uppercase tracking-wide text-subtle">Education</p>
                <p className="text-secondary">{data.education[0].degree}</p>
                <p>{data.education[0].institution}</p>
              </div>
            )}
            {data.certifications[0] && (
              <div>
                <p className="font-semibold uppercase tracking-wide text-subtle">Certs</p>
                <p className="text-secondary">{data.certifications[0].name}</p>
                <p>{data.certifications[0].issuer}</p>
              </div>
            )}
          </div>
        )}

        <Button className="w-full" onClick={onOpenFull}>
          <ExternalLink className="h-4 w-4" /> Open full preview
        </Button>
        <p className={cn('text-center text-[10px] text-subtle')}>
          Opens the complete {theme} theme in a new tab
        </p>
      </div>
    </div>
  );
}
