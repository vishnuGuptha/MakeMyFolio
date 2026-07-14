import { ExternalLink } from 'lucide-react';
import { TerminalContainer, TerminalSection, TerminalHeading } from '../layout/TerminalSection';
import TerminalWindow from '../components/TerminalWindow';
import type { Experience } from '@/types';

function shortHash(id: string): string {
  return id.slice(-7).padStart(7, '0');
}

function ExperienceLog({ items, title, number, command }: {
  items: Experience[];
  title: string;
  number: string;
  command: string;
}) {
  if (!items.length) return null;
  return (
    <TerminalSection id={title.toLowerCase().replace(/\s/g, '-')}>
      <TerminalContainer>
        <TerminalHeading number={number} title={title} command={command} />
        <TerminalWindow title={`git log — ${title.toLowerCase()}`}>
          <p className="text-accent text-xs mb-4">$ {command}</p>
          <div className="space-y-6">
            {items.map((exp) => (
              <div key={exp._id} className="border-l-2 border-accent/30 pl-4">
                <p className="text-primary font-semibold">
                  <span className="text-accent">{shortHash(exp._id)}</span>{' '}
                  {exp.role} @ {exp.company}
                </p>
                <p className="text-xs text-subtle mt-1">
                  {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                  {exp.location && ` · ${exp.location}`}
                </p>
                <ul className="mt-2 space-y-1">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} className="text-sm text-secondary">
                      <span className="text-accent">*</span> {bullet}
                    </li>
                  ))}
                </ul>
                {exp.projects.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {exp.projects.map((proj) => (
                      <span key={proj.name} className="text-xs">
                        {proj.url ? (
                          <a
                            href={proj.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline inline-flex items-center gap-1"
                          >
                            {proj.name} <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-subtle">{proj.name}</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </TerminalWindow>
      </TerminalContainer>
    </TerminalSection>
  );
}

export default function TerminalExperienceSection({ experiences }: { experiences: Experience[] }) {
  const jobs = experiences.filter((e) => e.type === 'job');
  const internships = experiences.filter((e) => e.type === 'internship');

  return (
    <>
      <ExperienceLog
        items={jobs}
        title="Experience"
        number="03"
        command="git log --oneline --experience"
      />
      <ExperienceLog
        items={internships}
        title="Internships"
        number="04"
        command="git log --oneline --internships"
      />
    </>
  );
}
