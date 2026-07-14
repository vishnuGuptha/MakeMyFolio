import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { SpotlightContainer, SpotlightSection, SpotlightHeading } from '../layout/SpotlightSection';
import type { Experience } from '@/types';

function ExperienceCards({ items, title, number }: {
  items: Experience[];
  title: string;
  number: string;
}) {
  if (!items.length) return null;
  return (
    <SpotlightSection id={title.toLowerCase().replace(/\s/g, '-')}>
      <SpotlightContainer>
        <SpotlightHeading number={number} title={title} />
        <div className="grid gap-6">
          {items.map((exp, i) => (
            <motion.article
              key={exp._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="spotlight-exp-card p-6 md:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-bold text-primary">{exp.role}</h3>
                  <p className="text-accent font-medium mt-1">{exp.company}</p>
                </div>
                <span className="spotlight-date-pill text-xs font-mono px-3 py-1 rounded-full shrink-0">
                  {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                </span>
              </div>
              {exp.location && <p className="text-xs text-subtle mb-4">{exp.location}</p>}
              <ul className="space-y-2.5 mb-4 list-none m-0 p-0">
                {exp.bullets.map((bullet, j) => (
                  <li key={j} className="text-sm text-secondary flex gap-2 items-start">
                    <span className="text-accent shrink-0 leading-relaxed">—</span>
                    <span className="flex-1 leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
              {exp.projects.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                  {exp.projects.map((proj) => (
                    <span key={proj.name} className="text-xs">
                      {proj.url ? (
                        <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
                          {proj.name} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-subtle">{proj.name}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </motion.article>
          ))}
        </div>
      </SpotlightContainer>
    </SpotlightSection>
  );
}

export default function SpotlightExperienceSection({ experiences }: { experiences: Experience[] }) {
  const jobs = experiences.filter((e) => e.type === 'job');
  const internships = experiences.filter((e) => e.type === 'internship');

  return (
    <>
      <ExperienceCards items={jobs} title="Experience" number="03" />
      <ExperienceCards items={internships} title="Internships" number="04" />
    </>
  );
}
