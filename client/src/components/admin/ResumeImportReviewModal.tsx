import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DialogRoot, DialogContent } from '@/components/ui/Dialog';
import { cn } from '@/lib/utils';

export type ExtractedResumePreview = {
  displayName: string;
  content: {
    name: string;
    title: string;
    tagline: string;
    bio: string;
    location: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    yearsExperience: string;
    educationHighlight: string;
    stats: { label: string; value: string }[];
    aiTools: string[];
    portfolioUrl?: string;
  };
  skills: { name: string; skills: { name: string; level?: string }[] }[];
  experiences: {
    type: string;
    company: string;
    role: string;
    bullets: string[];
  }[];
  projects: { title: string; description: string }[];
  education: { degree: string; institution: string }[];
  certifications: { name: string; issuer: string }[];
};

export type ImportSectionKey =
  | 'content'
  | 'skills'
  | 'experiences'
  | 'projects'
  | 'education'
  | 'certifications';

export type ImportSectionFlags = Record<ImportSectionKey, boolean>;

export const DEFAULT_IMPORT_SECTIONS: ImportSectionFlags = {
  content: true,
  skills: true,
  experiences: true,
  projects: true,
  education: true,
  certifications: true,
};

type ResumeImportReviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extracted: ExtractedResumePreview | null;
  summary: {
    displayName: string;
    skills: number;
    experiences: number;
    projects: number;
    education: number;
    certifications: number;
  } | null;
  applying: boolean;
  onApply: (sections: ImportSectionFlags) => void;
};

const SECTION_META: {
  key: ImportSectionKey;
  label: string;
  hint: (s: NonNullable<ResumeImportReviewModalProps['summary']>, e: ExtractedResumePreview) => string;
}[] = [
  {
    key: 'content',
    label: 'Profile & hero',
    hint: (_s, e) =>
      [e.content.name || e.displayName, e.content.title].filter(Boolean).join(' · ') ||
      'Name, title, bio, links',
  },
  {
    key: 'skills',
    label: 'Skills',
    hint: (s) => `${s.skills} categor${s.skills === 1 ? 'y' : 'ies'}`,
  },
  {
    key: 'experiences',
    label: 'Experience',
    hint: (s) => `${s.experiences} role${s.experiences === 1 ? '' : 's'}`,
  },
  {
    key: 'projects',
    label: 'Projects',
    hint: (s) => `${s.projects} project${s.projects === 1 ? '' : 's'}`,
  },
  {
    key: 'education',
    label: 'Education',
    hint: (s) => `${s.education} entr${s.education === 1 ? 'y' : 'ies'}`,
  },
  {
    key: 'certifications',
    label: 'Certifications',
    hint: (s) => `${s.certifications} cert${s.certifications === 1 ? '' : 's'}`,
  },
];

export function ResumeImportReviewModal({
  open,
  onOpenChange,
  extracted,
  summary,
  applying,
  onApply,
}: ResumeImportReviewModalProps) {
  const [sections, setSections] = useState<ImportSectionFlags>(DEFAULT_IMPORT_SECTIONS);

  const selectedCount = useMemo(
    () => Object.values(sections).filter(Boolean).length,
    [sections]
  );

  if (!extracted || !summary) return null;

  const bioPreview = (extracted.content.bio || '').trim().slice(0, 160);

  return (
    <DialogRoot
      open={open}
      onOpenChange={(next) => {
        if (applying) return;
        onOpenChange(next);
        if (next) setSections(DEFAULT_IMPORT_SECTIONS);
      }}
    >
      <DialogContent title="Review resume import" className="max-w-lg w-[calc(100%-1.5rem)] max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          <p className="text-sm text-secondary">
            Choose what to replace. Unchecked sections keep your current data. You can undo once after
            applying.
          </p>

          <div className="rounded-xl border border-border/70 bg-muted/30 px-3 py-2.5 text-left">
            <p className="text-sm font-semibold text-primary">
              {summary.displayName || extracted.content.name || 'Resume'}
            </p>
            {extracted.content.title ? (
              <p className="mt-0.5 text-xs text-subtle">{extracted.content.title}</p>
            ) : null}
            {bioPreview ? (
              <p className="mt-2 text-xs leading-relaxed text-secondary">
                {bioPreview}
                {(extracted.content.bio || '').length > 160 ? '…' : ''}
              </p>
            ) : null}
          </div>

          <ul className="space-y-2">
            {SECTION_META.map(({ key, label, hint }) => {
              const countHint = hint(summary, extracted);
              const empty =
                (key === 'skills' && summary.skills === 0) ||
                (key === 'experiences' && summary.experiences === 0) ||
                (key === 'projects' && summary.projects === 0) ||
                (key === 'education' && summary.education === 0) ||
                (key === 'certifications' && summary.certifications === 0);
              const disableEmpty = empty;

              return (
                <li key={key}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                      sections[key]
                        ? 'border-[#0066FF]/40 bg-[#0066FF]/5'
                        : 'border-border/70 hover:border-[#0066FF]/20',
                      disableEmpty ? 'opacity-60' : ''
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 accent-[#0066FF]"
                      checked={sections[key]}
                      disabled={disableEmpty}
                      onChange={(e) =>
                        setSections((prev) => ({ ...prev, [key]: e.target.checked }))
                      }
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-primary">{label}</span>
                      <span className="block text-xs text-subtle">
                        {disableEmpty ? 'Nothing found in resume' : countHint}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              className="home-cta-primary h-11 flex-1 border-0 font-semibold shadow-none"
              loading={applying}
              disabled={applying || selectedCount === 0}
              onClick={() => onApply(sections)}
            >
              Apply selected ({selectedCount})
            </Button>
            <Button
              variant="outline"
              className="home-cta-secondary h-11 flex-1 font-semibold"
              disabled={applying}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
