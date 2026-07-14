import type { Education } from '@/types';
import { EducationAttachment } from '@/components/EducationAttachment';
import StudioSection, { StudioSectionHeader } from '../layout/StudioSection';
import StudioEmptyState from '../components/StudioEmptyState';

export default function StudioEducationSection({ education }: { education: Education[] }) {
  if (!education?.length) return null;
  const sorted = [...education].sort((a, b) => a.order - b.order);

  return (
    <StudioSection id="education" band="light">
      <StudioSectionHeader title="Education" lead="Academic foundations behind the craft." />
      {!sorted.length ? (
        <StudioEmptyState title="No education entries" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((edu) => (
            <article
              key={edu._id}
              className="rounded-2xl border border-[var(--band-border)] bg-[var(--band-surface)] p-5"
            >
              <h3 className="font-bold text-[var(--band-ink)]">{edu.degree}</h3>
              <p className="studio-mono text-sm mt-1 text-[var(--band-muted)]">{edu.institution}</p>
              <p className="studio-mono text-xs mt-2 text-[var(--band-muted)]">
                {[edu.startYear, edu.endYear].filter(Boolean).join(' – ')}
                {edu.cgpa ? ` · CGPA ${edu.cgpa}` : ''}
              </p>
              <EducationAttachment education={edu} />
            </article>
          ))}
        </div>
      )}
    </StudioSection>
  );
}
