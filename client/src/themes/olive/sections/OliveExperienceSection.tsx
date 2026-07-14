import { Briefcase, GraduationCap, Monitor, Search, LineChart, ExternalLink } from 'lucide-react';
import { usePortfolioData } from '@/context/PortfolioContext';
import type { Experience } from '@/types';
import OliveSection, { OliveSectionHeader } from '../components/OliveSection';
import OliveEmptyState from '../components/OliveEmptyState';
import { OliveCertBadges, OliveContactLinks } from '../components/OliveContactBlocks';

const ICONS = [Monitor, LineChart, Search, Briefcase, GraduationCap];

function ExperienceCards({ items }: { items: Experience[] }) {
  return (
    <div className="olive-outline-list">
      {items.map((exp, i) => {
        const Icon = ICONS[i % ICONS.length];
        const dates = `${exp.startDate} — ${exp.isCurrent ? 'Present' : exp.endDate}`;
        return (
          <article key={exp._id} className="olive-outline-card">
            <Icon className="olive-outline-icon" strokeWidth={1.45} aria-hidden />
            <div>
              <h3 className="olive-outline-title">{exp.role}</h3>
              <p className="olive-outline-company">{exp.company}</p>
              <p className="olive-outline-meta">
                {dates}
                {exp.location ? ` · ${exp.location}` : ''}
              </p>
              {exp.bullets?.length > 0 && (
                <ul className="olive-outline-desc">
                  {exp.bullets.slice(0, 3).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
              {exp.projects?.length > 0 && (
                <div className="olive-outline-links">
                  {exp.projects.map((p) =>
                    p.url ? (
                      <a
                        key={p.name}
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="olive-outline-link"
                      >
                        {p.name} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span key={p.name} className="olive-outline-chip">
                        {p.name}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function OliveExperienceSection({ experiences }: { experiences: Experience[] }) {
  const { content, certifications, settings } = usePortfolioData();
  const jobs = experiences.filter((e) => e.type === 'job').sort((a, b) => a.order - b.order);
  const internships = experiences
    .filter((e) => e.type === 'internship')
    .sort((a, b) => a.order - b.order);
  const items = [...jobs, ...internships];
  const isSingle = (settings?.layoutMode || 'single-page') === 'single-page';

  const left = !items.length ? (
    <OliveEmptyState
      title="No experience yet"
      hint="Add jobs or internships in the Experience editor."
    />
  ) : (
    <ExperienceCards items={items} />
  );

  if (!isSingle) {
    return (
      <OliveSection id="experience" panel="bare">
        <OliveSectionHeader title="Experience" />
        {left}
      </OliveSection>
    );
  }

  return (
    <OliveSection id="experience" panel="bare" className="olive-section-tight-bottom">
      <div className="olive-help-split">
        <div>
          <OliveSectionHeader title="Experience" />
          {left}
        </div>
        <aside className="olive-help-aside">
          <OliveSectionHeader title="Get in touch" />
          {content && <OliveContactLinks content={content} />}
          {(certifications || []).length > 0 && (
            <div id="certifications" className="olive-cert-block">
              <OliveSectionHeader title="Certifications" />
              <OliveCertBadges certifications={certifications || []} />
            </div>
          )}
        </aside>
      </div>
    </OliveSection>
  );
}
