import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { publicApi } from '@/api';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { usePortfolioData } from '@/context/PortfolioContext';
import { TerminalContainer } from './layout/TerminalSection';
import TerminalWindow from './components/TerminalWindow';
import TerminalTypewriter from './components/TerminalTypewriter';
import type { HeroProps } from '../types';

function buildSkillPhrases(content: HeroProps['content'], skillNames: string[]): string[] {
  if (skillNames.length) return skillNames;
  if (content.tagline) {
    const parts = content.tagline.split(/[,•|/]/).map((s) => s.trim()).filter(Boolean);
    if (parts.length > 1) return parts;
  }
  return ['React.js', 'TypeScript', 'Node.js'];
}

function TerminalAvatar({ imageUrl, name }: { imageUrl?: string; name: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <TerminalWindow title="imgcat avatar.png" className="w-full max-w-[240px] mx-auto lg:mx-0">
      <div className="terminal-avatar-frame">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="terminal-avatar-img" />
        ) : (
          <div className="terminal-avatar-fallback" aria-hidden>
            {initials || '?'}
          </div>
        )}
      </div>
      <p className="terminal-output-line text-[10px] text-subtle mt-3 text-center truncate">
        ./assets/{name.split(' ')[0]?.toLowerCase() || 'profile'}.png
      </p>
    </TerminalWindow>
  );
}

export default function TerminalHero({ content, slug }: HeroProps) {
  const portfolio = usePortfolioData();
  const bioExcerpt = (content.bio || content.tagline || '').slice(0, 280);

  const skillNames = useMemo(
    () =>
      portfolio.skills
        ?.flatMap((cat) => cat.skills.sort((a, b) => a.order - b.order).map((s) => s.name))
        .slice(0, 10) ?? [],
    [portfolio.skills]
  );

  const typewriterPhrases = useMemo(
    () => buildSkillPhrases(content, skillNames),
    [content, skillNames]
  );

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="min-h-[calc(100vh-3.5rem)] flex items-center pt-8 pb-12 relative z-10">
      <TerminalContainer>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid lg:grid-cols-[1fr_minmax(200px,240px)] gap-6 items-start"
        >
          <TerminalWindow title="bash — portfolio">
            <div className="space-y-3">
              <p className="terminal-output-line">
                <span className="text-accent">$</span> whoami
              </p>
              <p className="terminal-output-line terminal-output-value pl-4">{content.name}</p>

              <p className="terminal-output-line pt-2">
                <span className="text-accent">$</span> cat role.txt
              </p>
              <p className="terminal-output-line terminal-output-value pl-4">{content.title || 'Software Engineer'}</p>

              {content.location && (
                <>
                  <p className="terminal-output-line pt-2">
                    <span className="text-accent">$</span> echo $LOCATION
                  </p>
                  <p className="terminal-output-line terminal-output-key pl-4">{content.location}</p>
                </>
              )}

              <p className="terminal-output-line pt-2">
                <span className="text-accent">$</span> skills --rotate
              </p>
              <p className="terminal-output-line pl-4">
                <TerminalTypewriter words={typewriterPhrases} />
              </p>

              {bioExcerpt && (
                <>
                  <p className="terminal-output-line pt-2">
                    <span className="text-accent">$</span> cat about.txt
                  </p>
                  <p className="terminal-output-line text-subtle pl-4 leading-relaxed">{bioExcerpt}</p>
                </>
              )}

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollTo('contact')}
                  className="terminal-hero-link text-sm"
                >
                  $ ./contact.sh
                </button>
                {content.resumeUrl && (
                  <>
                    <a
                      href={publicApi.getResumeUrl(slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="terminal-hero-link text-sm"
                    >
                      $ open resume.pdf
                    </a>
                    <a
                      href={publicApi.getResumeUrl(slug, true)}
                      download
                      className="terminal-hero-link text-sm"
                    >
                      $ curl -O resume.pdf
                    </a>
                  </>
                )}
                <SocialIconLinks
                  content={content}
                  size="sm"
                  linkClassName="text-subtle hover:text-accent border border-border/40 hover:border-accent/50"
                />
              </div>
            </div>
          </TerminalWindow>

          <div className="order-first lg:order-none flex justify-center lg:justify-end">
            <TerminalAvatar imageUrl={content.profileImageUrl} name={content.name} />
          </div>
        </motion.div>
      </TerminalContainer>
    </section>
  );
}
