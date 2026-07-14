import { Search } from 'lucide-react';
import { usePortfolioData } from '@/context/PortfolioContext';
import ProjectMediaPreview from '@/themes/shared/ProjectMediaPreview';
import type { Project } from '@/types';
import OliveSection, { OliveSectionHeader } from '../components/OliveSection';
import OliveEmptyState from '../components/OliveEmptyState';
import OliveButton from '../components/OliveButton';

function stylizedTitle(title: string) {
  const parts = title.trim().split(/\s+/);
  if (parts.length < 2) return title.toUpperCase();
  const last = parts[parts.length - 1];
  const head = parts.slice(0, -1).join(' ');
  return (
    <>
      {head.toUpperCase()} <strong>{last.toUpperCase()}</strong>
    </>
  );
}

export default function OliveProjectsSection({ projects }: { projects: Project[] }) {
  const { settings } = usePortfolioData();
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  const featured = sorted.filter((p) => p.featured);
  const grid = (featured.length ? featured : sorted).slice(0, 6);
  const previewMode = settings?.projectPreviewMode === 'webview' ? 'webview' : 'image';

  return (
    <OliveSection id="projects" panel="island">
      <OliveSectionHeader title="Explore projects I've built" />
      {!grid.length ? (
        <OliveEmptyState title="No projects yet" hint="Add projects in the CMS to showcase them here." />
      ) : (
        <div className="olive-project-grid">
          {grid.map((proj) => {
            const href = proj.liveUrl || proj.githubUrl;
            return (
              <article key={proj._id} className="olive-project-card">
                <div className="olive-project-media">
                  {proj.imageUrl || proj.liveUrl ? (
                    <ProjectMediaPreview
                      title={proj.title}
                      imageUrl={proj.imageUrl}
                      liveUrl={proj.liveUrl}
                      mode={previewMode}
                    />
                  ) : (
                    <div className="olive-project-media-fallback" aria-hidden />
                  )}
                </div>
                <div className="olive-project-body">
                  <h3 className="olive-project-title">{stylizedTitle(proj.title)}</h3>
                  {proj.description?.trim() && (
                    <>
                      <p className="olive-project-detail-label">Main goals and indicators:</p>
                      <p className="olive-project-detail-copy">{proj.description}</p>
                    </>
                  )}
                  {href && (
                    <OliveButton href={href} target="_blank" rel="noopener noreferrer" size="sm">
                      <Search className="h-3.5 w-3.5" aria-hidden />
                      View details
                    </OliveButton>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </OliveSection>
  );
}
