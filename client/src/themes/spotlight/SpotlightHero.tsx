import { useState, useEffect, useMemo } from 'react';
import { ArrowUp, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { publicApi } from '@/api';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { SpotlightContainer } from './layout/SpotlightSection';
import { usePortfolioData } from '@/context/PortfolioContext';
import TypewriterText from './components/TypewriterText';
import FloatingAvatar from './components/FloatingAvatar';
import type { HeroProps } from '../types';

/** Build the rotating typewriter phrase array from profile data */
function buildTypewriterPhrases(
  content: HeroProps['content'],
  skillNames: string[]
): string[] {
  if (skillNames.length > 0) {
    return skillNames;
  }

  if (content.tagline) {
    const fromTagline = content.tagline
      .split(/[,•|/]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length < 40);
    if (fromTagline.length > 1) return fromTagline;
  }

  if (content.aiTools?.length) {
    return content.aiTools;
  }

  return ['React.js', 'Next.js', 'TypeScript', 'Node.js'];
}

export default function SpotlightHero({ content, slug }: HeroProps) {
  const [showTop, setShowTop] = useState(false);
  const portfolio = usePortfolioData();
  const firstName = content.name.split(' ')[0];
  const bioExcerpt = content.bio || content.tagline;

  const skillNames = useMemo(
    () =>
      portfolio.skills
        ?.flatMap((cat) => cat.skills.sort((a, b) => a.order - b.order).map((s) => s.name))
        .slice(0, 10) ?? [],
    [portfolio.skills]
  );

  const typewriterPhrases = useMemo(
    () => buildTypewriterPhrases(content, skillNames),
    [content, skillNames]
  );

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="min-h-[calc(100vh-4rem)] flex items-center pt-8 pb-16 overflow-hidden">
      <SpotlightContainer>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] gap-8 lg:gap-12 items-center"
        >
          <div className="min-w-0 order-2 lg:order-1">
            {content.location && (
              <div className="spotlight-availability-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-subtle mb-6">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Available &bull; {content.location}
              </div>
            )}

            <p className="text-4xl md:text-5xl font-bold text-primary mb-1">Hello.</p>
            <p className="text-xl md:text-2xl text-secondary mb-4">
              I&apos;m <span className="font-bold text-primary">{firstName}</span>
            </p>

            {content.title && (
              <h1 className="theme-hero-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-balance mb-4">
                {content.title}
              </h1>
            )}

            <div className="spotlight-typewriter-row flex items-center gap-2 mb-6 min-h-[2.5rem] md:min-h-[3rem]">
              <span className="w-[3px] self-stretch min-h-[1.5em] shrink-0 rounded-full bg-accent" aria-hidden />
              <p className="theme-hero-title text-2xl sm:text-3xl md:text-4xl font-bold leading-tight m-0">
                <TypewriterText words={typewriterPhrases} />
              </p>
            </div>

            {bioExcerpt && (
              <p className="text-base md:text-lg text-subtle leading-relaxed mb-8 line-clamp-4 md:line-clamp-none">
                {bioExcerpt}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo('contact')}
                className="spotlight-cta-primary px-6 py-3 rounded-full text-sm font-semibold transition-colors"
              >
                Got a project?
              </button>
              {content.resumeUrl && (
                <a
                  href={publicApi.getResumeUrl(slug, true)}
                  download
                  className="spotlight-cta-outline inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  My resume
                </a>
              )}
            </div>

            <SocialIconLinks
              content={content}
              className="mt-6"
              linkClassName="text-subtle hover:text-accent border border-border/50 hover:border-accent/40"
            />
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end min-w-0">
            <FloatingAvatar imageUrl={content.profileImageUrl} name={content.name} />
          </div>
        </motion.div>
      </SpotlightContainer>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-30 rounded-full bg-accent p-3 text-black shadow-lg hover:bg-accent-hover transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </section>
  );
}
