import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { SpotlightContainer, SpotlightSection, SpotlightHeading } from '../layout/SpotlightSection';
import ProjectMediaPreview from '@/themes/shared/ProjectMediaPreview';
import type { Project } from '@/types';

function ProjectBento({ projects, title, number }: {
  projects: Project[];
  title: string;
  number: string;
}) {
  if (!projects.length) return null;
  return (
    <SpotlightSection id={title === 'Featured Projects' ? 'projects' : 'personal-projects'}>
      <SpotlightContainer>
        <SpotlightHeading number={number} title={title} />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj, i) => (
            <motion.article
              key={proj._id}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className={`spotlight-project-card project-card-flat-top group overflow-hidden ${i === 0 ? 'md:col-span-2 lg:col-span-2' : ''}`}
            >
              <ProjectMediaPreview
                title={proj.title}
                imageUrl={proj.imageUrl}
                liveUrl={proj.liveUrl}
                className={i === 0 ? 'md:aspect-[21/9]' : undefined}
              />
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-primary group-hover:text-accent transition-colors">
                    {proj.liveUrl ? (
                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer">{proj.title}</a>
                    ) : (
                      proj.title
                    )}
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-subtle hover:text-accent">
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="text-subtle hover:text-accent">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-sm text-subtle line-clamp-2 mb-3">{proj.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {proj.techStack.slice(0, 4).map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent">{t}</span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </SpotlightContainer>
    </SpotlightSection>
  );
}

export default function SpotlightProjectsSection({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured && !p.isPersonalProject);
  const personal = projects.filter((p) => p.isPersonalProject);
  const otherFeatured = projects.filter((p) => p.featured && p.isPersonalProject);

  const displayFeatured = featured.length > 0 ? featured : otherFeatured.slice(0, 2);
  const displayPersonal = personal.length > 0 ? personal : projects.filter((p) => !p.featured);

  return (
    <>
      <ProjectBento projects={displayFeatured} title="Featured Projects" number="05" />
      <ProjectBento projects={displayPersonal} title="Personal Projects" number="06" />
    </>
  );
}
