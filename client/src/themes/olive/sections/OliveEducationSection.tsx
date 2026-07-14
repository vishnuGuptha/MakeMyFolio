import type { Education } from '@/types';
import { EducationAttachment } from '@/components/EducationAttachment';
import OliveSection, { OliveSectionHeader } from '../components/OliveSection';
import OliveEmptyState from '../components/OliveEmptyState';

export default function OliveEducationSection({ education }: { education: Education[] }) {
  const sorted = [...(education || [])].sort((a, b) => a.order - b.order);

  return (
    <OliveSection id="education" panel="bare">
      <OliveSectionHeader title="Education" />
      {!sorted.length ? (
        <OliveEmptyState title="No education entries" hint="Add education in the CMS." />
      ) : (
        <div className="olive-edu-grid">
          {sorted.map((edu) => (
            <article key={edu._id} className="olive-edu-card">
              <h3>{edu.degree || edu.institution}</h3>
              <p className="mt-1 font-semibold text-[var(--olive-accent)]">{edu.institution}</p>
              <p className="mt-2">
                {edu.startYear} — {edu.endYear}
                {edu.location ? ` · ${edu.location}` : ''}
              </p>
              {(edu.cgpa || edu.status) && (
                <p className="mt-2">
                  {[edu.cgpa && `CGPA ${edu.cgpa}`, edu.status].filter(Boolean).join(' · ')}
                </p>
              )}
              <EducationAttachment education={edu} />
            </article>
          ))}
        </div>
      )}
    </OliveSection>
  );
}
