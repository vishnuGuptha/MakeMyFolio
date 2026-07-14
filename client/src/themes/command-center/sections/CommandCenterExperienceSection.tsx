import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { CommandCenterContainer, CommandCenterSection, CommandCenterHeading } from '../layout/CommandCenterSection';
import GlassCard from '../components/GlassCard';
import type { Experience } from '@/types';

function ExperienceBlock({ items, title }: { items: Experience[]; title: string }) {
  if (!items.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">{title}</h3>
      <div className="relative pl-6 border-l border-white/10 space-y-5">
        {items.map((exp, i) => (
          <motion.div
            key={exp._id}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="relative"
          >
            <span className="cc-timeline-node absolute -left-[31px] top-1" />
            <GlassCard hover={false}>
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-lg font-bold text-primary">{exp.role}</h3>
                  <p className="text-accent text-sm">{exp.company}</p>
                </div>
                <span className="text-xs text-subtle shrink-0">
                  {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                </span>
              </div>
              {exp.location && <p className="text-xs text-subtle mb-3">{exp.location}</p>}
              <ul className="space-y-1.5">
                {exp.bullets.map((bullet, j) => (
                  <li key={j} className="text-sm text-subtle flex gap-2">
                    <span className="text-accent shrink-0">▸</span>
                    {bullet}
                  </li>
                ))}
              </ul>
              {exp.projects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
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
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function CommandCenterExperienceSection({ experiences }: { experiences: Experience[] }) {
  const jobs = experiences.filter((e) => e.type === 'job');
  const internships = experiences.filter((e) => e.type === 'internship');

  if (!jobs.length && !internships.length) return null;

  return (
    <CommandCenterSection id="experience">
      <CommandCenterContainer>
        <CommandCenterHeading number="03" title="Experience" />
        <div className="space-y-8">
          <ExperienceBlock items={jobs} title="Work" />
          <ExperienceBlock items={internships} title="Internships" />
        </div>
      </CommandCenterContainer>
    </CommandCenterSection>
  );
}
