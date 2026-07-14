import { UserRound } from 'lucide-react';
import OliveButton from './components/OliveButton';
import type { HeroProps } from '../types';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function OliveHero({ content }: HeroProps) {
  const fullName = content.name?.trim() || 'Your Name';
  const first = fullName.split(/\s+/).filter(Boolean)[0] || 'Your';

  const scrollAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="olive-hero">
      <div className="olive-panel-island olive-hero-panel">
        <div className="olive-rail">
          <div className="olive-hero-grid">
            <div className="olive-hero-copy">
              <p className="olive-hero-greet">Hello! My name is</p>
              <h1 className="olive-hero-name">{fullName}</h1>
              <p className="olive-hero-bio">
                {content.tagline?.trim() ||
                  content.bio?.trim() ||
                  `Welcome — explore ${first}'s work, experience, and how we can collaborate.`}
              </p>
              <OliveButton type="button" size="sm" onClick={scrollAbout}>
                About me
                <UserRound className="h-3.5 w-3.5" aria-hidden />
              </OliveButton>
            </div>

            <div className="olive-hero-photo-wrap">
              <div className="olive-hero-halo">
                <div className="olive-hero-ring">
                  {content.profileImageUrl ? (
                    <img
                      src={content.profileImageUrl}
                      alt={fullName}
                      className="olive-hero-photo"
                    />
                  ) : (
                    <div className="olive-hero-photo-fallback" aria-hidden>
                      {initials(fullName)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
