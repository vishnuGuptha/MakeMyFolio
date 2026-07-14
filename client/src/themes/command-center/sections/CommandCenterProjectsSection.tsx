import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { CommandCenterContainer, CommandCenterSection, CommandCenterHeading } from '../layout/CommandCenterSection';
import ProjectMediaPreview from '@/themes/shared/ProjectMediaPreview';
import type { Project } from '@/types';

function ProjectGrid({ projects, subtitle }: { projects: Project[]; subtitle: string }) {
  if (!projects.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-accent">{subtitle}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((proj, i) => (
          <motion.article
            key={proj._id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
            className="cc-glass-card cc-glass-card-static project-card-flat-top overflow-hidden p-0"
          >
            <div className="relative">
              <ProjectMediaPreview
                title={proj.title}
                imageUrl={proj.imageUrl}
                liveUrl={proj.liveUrl}
              />
              {proj.featured && (
                <span className="absolute top-3 right-3 z-[3] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[rgb(var(--primary))] text-white">
                  Featured
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold text-primary">
                  {proj.liveUrl ? (
                    <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                      {proj.title}
                    </a>
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
                {proj.techStack.slice(0, 5).map((t) => (
                  <span key={t} className="cc-tech-tag">{t}</span>
                ))}
              </div>
              {proj.liveUrl && (
                <a
                  href={proj.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-xs text-accent hover:underline"
                >
                  Live Demo →
                </a>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

export default function CommandCenterProjectsSection({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured && !p.isPersonalProject);
  const personal = projects.filter((p) => p.isPersonalProject);
  const otherFeatured = projects.filter((p) => p.featured && p.isPersonalProject);

  const displayFeatured = featured.length > 0 ? featured : otherFeatured.slice(0, 3);
  const displayPersonal = personal.length > 0 ? personal : projects.filter((p) => !p.featured);

  if (!displayFeatured.length && !displayPersonal.length) return null;

  return (
    <CommandCenterSection id="projects">
      <CommandCenterContainer>
        <CommandCenterHeading number="05" title="Featured Projects" />
        <div className="space-y-8">
          <ProjectGrid projects={displayFeatured} subtitle="Featured" />
          <ProjectGrid projects={displayPersonal} subtitle="Personal Projects" />
        </div>
      </CommandCenterContainer>
    </CommandCenterSection>
  );
}
