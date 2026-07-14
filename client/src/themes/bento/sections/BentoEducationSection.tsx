import BentoCard from '../components/BentoCard';
import { BentoSection } from '../BentoSectionWrapper';
import { EducationAttachment } from '@/components/EducationAttachment';
import type { Education } from '@/types';

export default function BentoEducationSection({ education }: { education: Education[] }) {
  if (!education?.length) return null;

  return (
    <BentoSection id="education" label="07" title="Education">
      <div className="grid md:grid-cols-2 gap-4">
        {[...education]
          .sort((a, b) => a.order - b.order)
          .map((edu) => (
            <BentoCard key={edu._id} className="p-6">
              <h3 className="font-bold text-base mb-1 text-[var(--bento-ink)]">{edu.degree}</h3>
              <p className="text-sm font-medium mb-2 text-[var(--bento-ink)]">{edu.institution}</p>
              <p className="text-xs bento-muted">
                {edu.startYear} — {edu.endYear}
                {edu.location && ` · ${edu.location}`}
              </p>
              {(edu.cgpa || edu.status) && (
                <p className="text-xs bento-muted mt-2">
                  {[edu.cgpa && `CGPA ${edu.cgpa}`, edu.status].filter(Boolean).join(' · ')}
                </p>
              )}
              <EducationAttachment education={edu} />
            </BentoCard>
          ))}
      </div>
    </BentoSection>
  );
}
