import ProjectMediaPreview from '@/themes/shared/ProjectMediaPreview';
import type { Project } from '@/types';
import StudioSection, { StudioSectionHeader } from '../layout/StudioSection';
import StudioTag, { toneFromSeed } from '../components/StudioTag';
import StudioGlowButton from '../components/StudioGlowButton';
import StudioClampText from '../components/StudioClampText';
import StudioEmptyState from '../components/StudioEmptyState';
import StudioWorkCarousel from '../components/StudioWorkCarousel';

function caseTag(proj: Project) {
  return proj.techStack?.[0] || (proj.featured ? 'Featured' : 'Product');
}

export default function StudioProjectsSection({ projects }: { projects: Project[] }) {
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  const caseStudies = sorted.filter((p) => p.featured).slice(0, 4);
  const cases = caseStudies.length ? caseStudies : sorted.slice(0, 4);
  const caseIds = new Set(cases.map((p) => p._id));
  const recent = sorted.filter((p) => !caseIds.has(p._id));

  return (
    <>
      <StudioSection id="projects" band="light">
        <StudioSectionHeader
          title="Case Studies"
          lead="Selected product stories — solving user and business problems with craft and clarity."
        />
        {!cases.length ? (
          <StudioEmptyState
            title="No case studies yet"
            hint="Mark projects as Featured in the CMS to highlight them here."
          />
        ) : (
          cases.map((proj, i) => {
            const tag = caseTag(proj);
            const href = proj.liveUrl || proj.githubUrl;
            return (
              <article
                key={proj._id}
                className={`studio-case${i % 2 === 1 ? ' studio-case-flip' : ''}`}
              >
                <div>
                  <StudioTag label={tag} tone={toneFromSeed(tag)} />
                  <h3 className="studio-case-title">{proj.title}</h3>
                  <StudioClampText
                    text={proj.description || 'Case study details coming soon.'}
                    lines={4}
                    className="studio-case-desc"
                  />
                  {href && (
                    <div className="studio-case-actions">
                      <StudioGlowButton href={href} target="_blank" rel="noopener noreferrer">
                        View case study &gt;
                      </StudioGlowButton>
                    </div>
                  )}
                </div>
                <div className="studio-case-media">
                  {proj.imageUrl || proj.liveUrl ? (
                    <ProjectMediaPreview
                      title={proj.title}
                      imageUrl={proj.imageUrl}
                      liveUrl={proj.liveUrl}
                      mode="webview"
                    />
                  ) : (
                    <div className="h-full w-full studio-skeleton" />
                  )}
                </div>
              </article>
            );
          })
        )}
      </StudioSection>

      {recent.length > 0 && (
        <StudioSection id="recent-work" band="dark">
          <StudioSectionHeader
            title="Recent Work"
            lead="Solving user & business problems with focused product delivery."
          />
          <StudioWorkCarousel projects={recent} />
        </StudioSection>
      )}
    </>
  );
}
