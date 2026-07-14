import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolioData } from '@/context/PortfolioContext';
import StudioGlowButton from './components/StudioGlowButton';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import type { HeroProps } from '../types';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function StudioHero({ content, slug, basePath: basePathProp }: HeroProps) {
  const { experiences, settings } = usePortfolioData();
  const layoutMode = settings?.layoutMode || 'single-page';
  const basePath = basePathProp ?? `/${slug}`;

  const companies = useMemo(() => {
    const fromContent = content.workedWith?.filter((w) => w.name?.trim()) || [];
    if (fromContent.length) return fromContent;
    const unique = new Map<string, { name: string; logoUrl?: string }>();
    [...experiences]
      .sort((a, b) => a.order - b.order)
      .forEach((exp) => {
        if (exp.company && !unique.has(exp.company.toLowerCase())) {
          unique.set(exp.company.toLowerCase(), { name: exp.company });
        }
      });
    return Array.from(unique.values()).slice(0, 6);
  }, [content.workedWith, experiences]);

  const goContact = () => {
    if (layoutMode === 'multi-page') return;
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const contactHref = layoutMode === 'multi-page' ? `${basePath}/contact` : undefined;
  const bio = content.bio || content.tagline || '';

  return (
    <section id="hero" className="studio-hero studio-band-dark">
      <div className="studio-container">
        <div className="studio-hero-grid">
          <div>
            <h1 className="studio-hero-title">{content.name || 'Your Name Here'}</h1>
            {bio && <p className="studio-hero-bio">{bio}</p>}
            <div className="studio-hero-cta">
              {contactHref ? (
                <Link to={contactHref} className="studio-btn">
                  Let&apos;s get started &gt;
                </Link>
              ) : (
                <StudioGlowButton onClick={goContact}>Let&apos;s get started &gt;</StudioGlowButton>
              )}
            </div>
            <SocialIconLinks
              content={content}
              className="mt-5"
              linkClassName="text-[var(--band-muted)] hover:text-[var(--band-ink)] border border-[var(--band-border)] hover:border-[var(--studio-accent)]"
            />
          </div>

          <div className="studio-avatar-ring" aria-hidden={!content.profileImageUrl}>
            {content.profileImageUrl ? (
              <img src={content.profileImageUrl} alt={content.name} />
            ) : (
              <div className="studio-avatar-fallback">{initials(content.name) || '?'}</div>
            )}
          </div>
        </div>

        <div className="studio-worked">
          <p className="studio-worked-label">Worked with</p>
          {companies.length === 0 ? (
            <p className="studio-mono text-sm text-[var(--band-muted)]">
              Add experience companies or “Worked with” entries in Profile to show logos here.
            </p>
          ) : (
            <div className="studio-logo-row">
              {companies.map((c) => (
                <span key={c.name} className="studio-logo-chip" title={c.name}>
                  {c.logoUrl ? <img src={c.logoUrl} alt={c.name} /> : c.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
