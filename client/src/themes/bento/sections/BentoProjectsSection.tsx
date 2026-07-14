import BentoCard from '../components/BentoCard';
import ProjectMediaPreview from '@/themes/shared/ProjectMediaPreview';
import { BentoSection } from '../BentoSectionWrapper';
import type { Project } from '@/types';

function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {projects.map((proj) => (
        <BentoCard key={proj._id} interactive className="bento-project-card project-card-flat-top flex flex-col overflow-hidden">
          <ProjectMediaPreview
            title={proj.title}
            imageUrl={proj.imageUrl}
            liveUrl={proj.liveUrl}
          />
          <div className="p-5 md:p-6 flex flex-col flex-1">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-lg font-bold leading-snug text-[var(--bento-ink)]">{proj.title}</h3>
              <div className="flex gap-2 shrink-0 text-sm">
                {proj.liveUrl && (
                  <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-70" aria-label="Live">
                    ↗
                  </a>
                )}
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 text-xs font-semibold uppercase tracking-wider bento-muted">
                    GH
                  </a>
                )}
              </div>
            </div>
            <p className="text-sm bento-muted leading-relaxed line-clamp-3 mb-4">{proj.description}</p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {proj.techStack.map((t) => (
                <span key={t} className="bento-chip">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </BentoCard>
      ))}
    </div>
  );
}

export default function BentoProjectsSection({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured && !p.isPersonalProject);
  const personal = projects.filter((p) => p.isPersonalProject);
  const otherFeatured = projects.filter((p) => p.featured && p.isPersonalProject);

  const displayFeatured = featured.length > 0 ? featured : otherFeatured.slice(0, 2);
  const displayPersonal =
    personal.length > 0 ? personal : projects.filter((p) => !p.featured && !displayFeatured.includes(p));

  return (
    <>
      {displayFeatured.length > 0 && (
        <BentoSection id="projects" label="05" title="Featured Projects">
          <ProjectGrid projects={displayFeatured} />
        </BentoSection>
      )}
      {displayPersonal.length > 0 && (
        <BentoSection id="personal-projects" label="06" title="Personal Projects">
          <ProjectGrid projects={displayPersonal} />
        </BentoSection>
      )}
    </>
  );
}
