import { usePortfolioData } from '@/context/PortfolioContext';
import type { AboutSectionProps } from '../../types';
import StudioSection, { StudioSectionHeader } from '../layout/StudioSection';
import StudioEmptyState from '../components/StudioEmptyState';

export default function StudioAboutSection({ content }: AboutSectionProps) {
  const { settings } = usePortfolioData();
  if (settings?.showTestimonials === false) return null;

  const testimonials = content.testimonials?.filter((t) => t.quote?.trim() && t.clientName?.trim()) || [];

  return (
    <StudioSection id="about" band="dark">
      <StudioSectionHeader
        title="Testimonials"
        lead="What collaborators and clients say about working together."
      />
      {!testimonials.length ? (
        <StudioEmptyState
          title="No testimonials yet"
          hint="Add testimonials in Profile & Hero, then enable Show Testimonials in Personalization."
        />
      ) : (
        <div className="studio-testimonial-grid">
          {testimonials.map((t, i) => (
            <article key={`${t.clientName}-${i}`} className="studio-testimonial-card">
              <span className="studio-quote-mark" aria-hidden>
                “
              </span>
              <p className="studio-testimonial-quote">{t.quote}</p>
              <div className="studio-testimonial-footer">
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt="" className="studio-testimonial-avatar" />
                ) : (
                  <div className="studio-testimonial-avatar flex items-center justify-center text-xs font-bold">
                    {t.clientName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="studio-testimonial-name">{t.clientName}</p>
                  {t.role && <p className="studio-mono text-[0.7rem] text-[var(--band-muted)]">{t.role}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </StudioSection>
  );
}
