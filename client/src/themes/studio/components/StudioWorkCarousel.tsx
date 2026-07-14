import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Project } from '@/types';
import ProjectMediaPreview from '@/themes/shared/ProjectMediaPreview';
import StudioClampText from './StudioClampText';
import StudioGlowButton from './StudioGlowButton';
import StudioEmptyState from './StudioEmptyState';

export default function StudioWorkCarousel({ projects }: { projects: Project[] }) {
  const sorted = useMemo(
    () => [...projects].sort((a, b) => a.order - b.order),
    [projects]
  );
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(2);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setVisible(mq.matches ? 2 : 1);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    setPage(0);
  }, [visible, sorted.length]);

  if (!sorted.length) {
    return (
      <StudioEmptyState
        title="No recent work yet"
        hint="Add projects in the CMS to populate this carousel."
      />
    );
  }

  const maxPage = Math.max(0, Math.ceil(sorted.length / visible) - 1);
  const safePage = Math.min(page, maxPage);
  const slice = sorted.slice(safePage * visible, safePage * visible + visible);

  return (
    <div className="studio-carousel">
      <button
        type="button"
        className="studio-carousel-btn"
        aria-label="Previous projects"
        disabled={safePage <= 0}
        onClick={() => setPage((p) => Math.max(0, p - 1))}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="studio-carousel-track">
        {slice.map((proj) => (
          <article key={proj._id} className="min-w-0">
            <div className="studio-work-card-media">
              {proj.imageUrl || proj.liveUrl ? (
                <ProjectMediaPreview
                  title={proj.title}
                  imageUrl={proj.imageUrl}
                  liveUrl={proj.liveUrl}
                  mode="webview"
                />
              ) : (
                <div className="h-full w-full studio-skeleton" aria-hidden />
              )}
            </div>
            <h3 className="studio-work-card-title">{proj.title}</h3>
            <StudioClampText
              text={proj.description || 'Project details coming soon.'}
              lines={2}
              className="studio-work-card-desc"
            />
            {(proj.liveUrl || proj.githubUrl) && (
              <div className="mt-3">
                <StudioGlowButton href={proj.liveUrl || proj.githubUrl} target="_blank" rel="noopener noreferrer">
                  Know more &gt;
                </StudioGlowButton>
              </div>
            )}
          </article>
        ))}
      </div>

      <button
        type="button"
        className="studio-carousel-btn"
        aria-label="Next projects"
        disabled={safePage >= maxPage}
        onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
