import { TerminalContainer, TerminalSection, TerminalHeading } from '../layout/TerminalSection';
import TerminalWindow from '../components/TerminalWindow';
import ProjectMediaPreview from '@/themes/shared/ProjectMediaPreview';
import type { Project } from '@/types';

function ProjectListing({ projects, title, number }: {
  projects: Project[];
  title: string;
  number: string;
}) {
  if (!projects.length) return null;
  const sectionId = title === 'Featured Projects' ? 'projects' : 'personal-projects';

  return (
    <TerminalSection id={sectionId}>
      <TerminalContainer>
        <TerminalHeading number={number} title={title} command="ls -la ~/projects/" />
        <div className="space-y-4">
          {projects.map((proj) => (
            <TerminalWindow key={proj._id} title={`~/projects/${proj.title.replace(/\s+/g, '-').toLowerCase()}`}>
              <ProjectMediaPreview
                title={proj.title}
                imageUrl={proj.imageUrl}
                liveUrl={proj.liveUrl}
                className="rounded-none mb-3"
              />
              <p className="text-primary text-xs sm:text-sm font-mono">
                {proj.featured ? <span className="text-accent">*</span> : '-'}
                rw-r--r--  1 dev  staff  {proj.title}
              </p>
              <p className="text-subtle mt-1 pl-4 line-clamp-2 text-xs sm:text-sm font-mono">{proj.description}</p>
              {proj.techStack.length > 0 && (
                <p className="text-secondary mt-1 pl-4 text-xs sm:text-sm font-mono">
                  [{proj.techStack.join(', ')}]
                </p>
              )}
              <div className="pl-4 mt-2 flex flex-wrap gap-3 text-accent text-xs sm:text-sm font-mono">
                {proj.liveUrl && (
                  <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    $ open {proj.liveUrl.replace(/^https?:\/\//, '').slice(0, 30)}...
                  </a>
                )}
                {proj.githubUrl && (
                  <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    $ git clone github
                  </a>
                )}
              </div>
            </TerminalWindow>
          ))}
        </div>
      </TerminalContainer>
    </TerminalSection>
  );
}

export default function TerminalProjectsSection({ projects }: { projects: Project[] }) {
  const featured = projects.filter((p) => p.featured && !p.isPersonalProject);
  const personal = projects.filter((p) => p.isPersonalProject);
  const otherFeatured = projects.filter((p) => p.featured && p.isPersonalProject);

  const displayFeatured = featured.length > 0 ? featured : otherFeatured.slice(0, 2);
  const displayPersonal = personal.length > 0 ? personal : projects.filter((p) => !p.featured);

  return (
    <>
      <ProjectListing projects={displayFeatured} title="Featured Projects" number="05" />
      <ProjectListing projects={displayPersonal} title="Personal Projects" number="06" />
    </>
  );
}
