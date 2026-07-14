import { ExternalLink } from 'lucide-react';
import type { Experience } from '@/types';
import StudioSection, { StudioSectionHeader } from '../layout/StudioSection';
import StudioTag, { toneFromSeed } from '../components/StudioTag';
import StudioClampText from '../components/StudioClampText';
import StudioEmptyState from '../components/StudioEmptyState';

function ExperienceList({ items }: { items: Experience[] }) {
  return (
    <div className="studio-exp-list">
      {items.map((exp) => {
        const dateLabel = `${exp.startDate} — ${exp.isCurrent ? 'Present' : exp.endDate}`;
        return (
          <article key={exp._id} className="studio-exp-card">
            <div className="studio-exp-card-top">
              <div className="min-w-0 flex-1">
                <StudioTag
                  label={exp.type === 'internship' ? 'Internship' : 'Experience'}
                  tone={exp.type === 'internship' ? 'blue' : toneFromSeed(exp.company)}
                />
                <h3 className="studio-exp-role">{exp.role}</h3>
                <p className="studio-exp-company">{exp.company}</p>
                {exp.location ? <p className="studio-exp-meta">{exp.location}</p> : null}
              </div>
              <span className="studio-exp-date">{dateLabel}</span>
            </div>

            {exp.bullets?.length > 0 && (
              <ul className="studio-exp-bullets">
                {exp.bullets.map((bullet, j) => (
                  <li key={j}>
                    <StudioClampText text={bullet} lines={3} className="studio-exp-bullet-text" />
                  </li>
                ))}
              </ul>
            )}

            {exp.projects?.length > 0 && (
              <div className="studio-exp-projects">
                {exp.projects.map((proj) =>
                  proj.url ? (
                    <a
                      key={proj.name}
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="studio-exp-project-link"
                    >
                      {proj.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span key={proj.name} className="studio-exp-project-chip">
                      {proj.name}
                    </span>
                  )
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default function StudioExperienceSection({ experiences }: { experiences: Experience[] }) {
  const jobs = experiences.filter((e) => e.type === 'job').sort((a, b) => a.order - b.order);
  const internships = experiences
    .filter((e) => e.type === 'internship')
    .sort((a, b) => a.order - b.order);

  if (!jobs.length && !internships.length) {
    return (
      <StudioSection id="experience" band="light">
        <StudioSectionHeader
          title="Experience"
          lead="Roles, impact, and the products shipped along the way."
        />
        <StudioEmptyState
          title="No experience yet"
          hint="Add jobs or internships in the Experience editor to show them here."
        />
      </StudioSection>
    );
  }

  return (
    <>
      {jobs.length > 0 && (
        <StudioSection id="experience" band="light">
          <StudioSectionHeader
            title="Experience"
            lead="Roles, impact, and the products shipped along the way."
          />
          <ExperienceList items={jobs} />
        </StudioSection>
      )}
      {internships.length > 0 && (
        <StudioSection id={jobs.length ? 'internships' : 'experience'} band={jobs.length ? 'dark' : 'light'}>
          <StudioSectionHeader
            title="Internships"
            lead="Early roles that shaped product instincts and craft."
          />
          <ExperienceList items={internships} />
        </StudioSection>
      )}
    </>
  );
}
