import { ExternalLink } from 'lucide-react';
import BentoCard from '../components/BentoCard';
import { BentoSection } from '../BentoSectionWrapper';
import type { Experience } from '@/types';

function ExperienceList({ items }: { items: Experience[] }) {
  return (
    <div className="space-y-4">
      {items.map((exp) => (
        <BentoCard key={exp._id} className="p-6 md:p-7">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
            <h3 className="text-lg font-bold text-[var(--bento-ink)]">{exp.role}</h3>
            <span className="bento-muted font-medium">@ {exp.company}</span>
          </div>
          <p className="text-xs bento-muted mb-4 tracking-wide">
            {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
            {exp.location && ` · ${exp.location}`}
          </p>
          <ul className="space-y-2 mb-3">
            {exp.bullets.map((bullet, j) => (
              <li key={j} className="text-sm bento-muted flex gap-2 leading-relaxed">
                <span className="text-[var(--bento-cta)] mt-1.5 shrink-0">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          {exp.projects.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {exp.projects.map((proj) =>
                proj.url ? (
                  <a
                    key={proj.name}
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bento-chip inline-flex items-center gap-1 hover:opacity-80"
                  >
                    {proj.name} <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span key={proj.name} className="bento-chip">
                    {proj.name}
                  </span>
                )
              )}
            </div>
          )}
        </BentoCard>
      ))}
    </div>
  );
}

export default function BentoExperienceSection({ experiences }: { experiences: Experience[] }) {
  const jobs = experiences.filter((e) => e.type === 'job').sort((a, b) => a.order - b.order);
  const internships = experiences
    .filter((e) => e.type === 'internship')
    .sort((a, b) => a.order - b.order);

  if (!jobs.length && !internships.length) return null;

  return (
    <>
      {jobs.length > 0 && (
        <BentoSection id="experience" label="03" title="Experience">
          <ExperienceList items={jobs} />
        </BentoSection>
      )}
      {internships.length > 0 && (
        <BentoSection id="internships" label="04" title="Internships">
          <ExperienceList items={internships} />
        </BentoSection>
      )}
    </>
  );
}
