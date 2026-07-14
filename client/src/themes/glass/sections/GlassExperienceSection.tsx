import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import type { Experience } from '@/types';

function ExperienceTimeline({ items, title, number }: {
  items: Experience[];
  title: string;
  number: string;
}) {
  if (!items.length) return null;
  return (
    <Section id={title.toLowerCase().replace(/\s/g, '-')}>
      <Container>
        <SectionHeading number={number} title={title} />
        <div className="space-y-12">
          {items.map((exp, i) => (
            <motion.div
              key={exp._id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-8 border-l-2 border-border hover:border-accent transition-colors"
            >
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-accent" />
              <div className="flex flex-wrap items-baseline gap-2 mb-1">
                <h3 className="text-lg font-semibold text-primary">{exp.role}</h3>
                <span className="text-accent">@ {exp.company}</span>
              </div>
              <p className="font-mono text-xs text-subtle mb-3">
                {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                {exp.location && ` · ${exp.location}`}
              </p>
              <ul className="space-y-2 mb-4">
                {exp.bullets.map((bullet, j) => (
                  <li key={j} className="text-sm text-secondary flex gap-2">
                    <span className="text-accent mt-1.5">▹</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {exp.projects.length > 0 && (
                <div className="space-y-2">
                  <p className="font-mono text-xs text-accent">Projects Worked</p>
                  {exp.projects.map((proj) => (
                    <div key={proj.name} className="flex items-center gap-2 text-sm flex-wrap">
                      {proj.url ? (
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-accent flex items-center gap-1"
                        >
                          {proj.name} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-primary">{proj.name}</span>
                      )}
                      {proj.techStack.map((t) => (
                        <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default function GlassExperienceSection({ experiences }: { experiences: Experience[] }) {
  const jobs = experiences.filter((e) => e.type === 'job');
  const internships = experiences.filter((e) => e.type === 'internship');

  return (
    <>
      <ExperienceTimeline items={jobs} title="Experience" number="03" />
      <ExperienceTimeline items={internships} title="Internships" number="04" />
    </>
  );
}
