import { useMemo, useState } from 'react';
import { Download, Eye } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { ResumePreviewModal, useResumeUrls } from '@/themes/shared/ResumePreviewModal';
import { SpotlightContainer } from './layout/SpotlightSection';
import { usePortfolioData } from '@/context/PortfolioContext';
import TypewriterText from './components/TypewriterText';
import FloatingAvatar from './components/FloatingAvatar';
import { SpotlightMagnetic } from './components/SpotlightMagnetic';
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

const ease = [0.22, 1, 0.36, 1] as const;

export default function SpotlightHero({ content, slug }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const portfolio = usePortfolioData();
  const firstName = content.name.split(' ')[0] || content.name;
  const bioExcerpt = content.bio || content.tagline;
  const [resumeOpen, setResumeOpen] = useState(false);
  const { viewUrl, downloadUrl } = useResumeUrls(slug);

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

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const item = (delay: number) =>
    reduceMotion
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.45, delay, ease },
        };

  return (
    <section id="hero" className="min-h-[calc(100vh-4rem)] flex items-center pt-8 pb-16 overflow-hidden">
      <SpotlightContainer>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(240px,320px)] gap-8 lg:gap-12 items-center">
          <div className="min-w-0 order-2 lg:order-1">
            {content.location && (
              <motion.div {...item(0)} className="mb-6">
                <div className="spotlight-availability-pill inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs text-subtle">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
                  <span>Available · {content.location}</span>
                </div>
              </motion.div>
            )}

            <motion.div {...item(0.05)} className="mb-5">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-primary tracking-tight leading-[1.1] m-0">
                Hello.
              </h1>
              <p className="mt-2 text-xl sm:text-2xl md:text-3xl text-secondary m-0">
                I&apos;m <span className="font-bold text-primary">{firstName}</span>
              </p>
            </motion.div>

            <motion.div
              {...item(0.12)}
              className="spotlight-typewriter-row inline-flex items-stretch gap-3 mb-7 min-h-[2.75rem] md:min-h-[3.25rem]"
            >
              <span className="spotlight-typewriter-bar spotlight-typewriter-bar--start" aria-hidden />
              <p className="spotlight-typewriter-text text-2xl sm:text-3xl md:text-4xl font-bold m-0 self-center">
                <TypewriterText words={typewriterPhrases} textClassName="theme-hero-title" />
              </p>
            </motion.div>

            {bioExcerpt ? (
              <motion.p
                {...item(0.2)}
                className="text-base md:text-lg text-subtle leading-relaxed mb-8 line-clamp-4 md:line-clamp-none"
              >
                {bioExcerpt}
              </motion.p>
            ) : null}

            <motion.div {...item(0.28)} className="flex flex-wrap gap-3">
              <SpotlightMagnetic>
                <button
                  type="button"
                  onClick={() => scrollTo('contact')}
                  className="spotlight-cta-primary px-6 py-3 rounded-full text-sm font-semibold"
                >
                  Got a project?
                </button>
              </SpotlightMagnetic>
              {content.resumeUrl ? (
                <>
                  <button
                    type="button"
                    onClick={() => setResumeOpen(true)}
                    className="spotlight-cta-outline inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
                  >
                    <Eye className="h-4 w-4" />
                    Preview resume
                  </button>
                  <a
                    href={downloadUrl}
                    download
                    className="spotlight-cta-outline inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </>
              ) : null}
            </motion.div>

            <motion.div {...item(0.34)}>
              <SocialIconLinks
                content={content}
                className="mt-6"
                linkClassName="text-subtle hover:text-accent border border-border/50 hover:border-accent/40"
              />
            </motion.div>
          </div>

          <motion.div
            {...item(0.18)}
            className="order-1 lg:order-2 flex justify-center lg:justify-end min-w-0"
          >
            <FloatingAvatar imageUrl={content.profileImageUrl} name={content.name} />
          </motion.div>
        </div>
      </SpotlightContainer>

      {content.resumeUrl ? (
        <ResumePreviewModal
          open={resumeOpen}
          onOpenChange={setResumeOpen}
          viewUrl={viewUrl}
          downloadUrl={downloadUrl}
          resumeUrl={content.resumeUrl}
        />
      ) : null}
    </section>
  );
}
