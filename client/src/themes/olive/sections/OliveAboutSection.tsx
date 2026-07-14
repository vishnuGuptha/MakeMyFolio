import { usePortfolioData } from '@/context/PortfolioContext';
import type { AboutSectionProps } from '../../types';
import OliveSection, { OliveSectionHeader } from '../components/OliveSection';
import OliveEmptyState from '../components/OliveEmptyState';

export default function OliveAboutSection({ content }: AboutSectionProps) {
  const { settings } = usePortfolioData();
  const bio = content.bio?.trim();
  const education = content.educationHighlight?.trim();
  const stats = content.stats || [];
  const primaryStat = stats[0];
  const testimonials =
    settings?.showTestimonials === false
      ? []
      : content.testimonials?.filter((t) => t.quote?.trim() && t.clientName?.trim()) || [];

  const hasContent = Boolean(bio || primaryStat || education);

  return (
    <OliveSection id="about" panel="bare">
      <OliveSectionHeader
        title="About me"
        lead={education || undefined}
      />

      {!hasContent ? (
        <OliveEmptyState title="Add your bio" hint="Fill bio and optional stats in Profile & Hero." />
      ) : (
        <>
          {primaryStat ? (
            <div className="olive-stat-row">
              <p className="olive-stat-value" aria-label={`${primaryStat.label}: ${primaryStat.value}`}>
                {primaryStat.value}
              </p>
              <p className="olive-stat-copy">
                {bio ||
                  `${primaryStat.label}. Add your story in Profile & Hero to fill this column.`}
              </p>
            </div>
          ) : (
            bio && <p className="olive-stat-copy">{bio}</p>
          )}
        </>
      )}

      {testimonials.length > 0 && (
        <>
          <div className="mt-10">
            <OliveSectionHeader title="Testimonials" />
          </div>
          <div className="olive-testimonial-grid">
            {testimonials.map((t, i) => (
              <article key={`${t.clientName}-${i}`} className="olive-testimonial-card">
                <p className="olive-testimonial-quote">“{t.quote}”</p>
                <p className="olive-testimonial-name">
                  {t.clientName}
                  {t.role ? ` · ${t.role}` : ''}
                </p>
              </article>
            ))}
          </div>
        </>
      )}
    </OliveSection>
  );
}
