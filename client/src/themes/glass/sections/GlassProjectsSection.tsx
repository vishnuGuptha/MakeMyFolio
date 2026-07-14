import { motion } from 'framer-motion';
import { ExternalLink, Github, Folder } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import ProjectMediaPreview from '@/themes/shared/ProjectMediaPreview';
import type { Project } from '@/types';

function ProjectGrid({ projects, title, number }: {
  projects: Project[];
  title: string;
  number: string;
}) {
  if (!projects.length) return null;
  return (
    <Section id={title === 'Featured Projects' ? 'projects' : 'personal-projects'}>
      <Container>
        <SectionHeading number={number} title={title} />
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((proj, i) => (
            <motion.article
              key={proj._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card project-card-flat-top overflow-hidden group hover:-translate-y-1 transition-transform duration-300"
            >
              <ProjectMediaPreview
                title={proj.title}
                imageUrl={proj.imageUrl}
                liveUrl={proj.liveUrl}
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Folder className="h-8 w-8 text-accent" />
                  <div className="flex gap-3">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-subtle hover:text-accent">
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {proj.liveUrl && (
                      <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="text-subtle hover:text-accent">
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                  {proj.liveUrl ? (
                    <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer">{proj.title}</a>
                  ) : (
                    proj.title
                  )}
                </h3>
                <p className="text-sm text-secondary mb-4 line-clamp-3">{proj.description}</p>
                <div className="flex flex-wrap gap-2">
                  {proj.techStack.map((t) => (
                    <Badge key={t} variant="outline">{t}</Badge>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default function GlassProjectsSection({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured && !p.isPersonalProject);
  const personal = projects.filter((p) => p.isPersonalProject);
  const otherFeatured = projects.filter((p) => p.featured && p.isPersonalProject);

  const displayFeatured = featured.length > 0 ? featured : otherFeatured.slice(0, 2);
  const displayPersonal = personal.length > 0 ? personal : projects.filter((p) => !p.featured);

  return (
    <>
      <ProjectGrid projects={displayFeatured} title="Featured Projects" number="05" />
      <ProjectGrid projects={displayPersonal} title="Personal Projects" number="06" />
    </>
  );
}
