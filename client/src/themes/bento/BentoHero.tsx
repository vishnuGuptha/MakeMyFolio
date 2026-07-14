import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePortfolioData } from '@/context/PortfolioContext';
import BentoCard from './components/BentoCard';
import BentoClampText from './components/BentoClampText';
import BentoMotif from './components/BentoMotif';
import ProjectMediaPreview from '@/themes/shared/ProjectMediaPreview';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { pickFeaturedProjects } from './utils/pickFeaturedProjects';
import type { HeroProps } from '../types';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function BentoHero({ content }: HeroProps) {
  const portfolio = usePortfolioData();
  const projects = useMemo(
    () => pickFeaturedProjects(portfolio.projects, 4),
    [portfolio.projects]
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeProject = projects[activeIdx] || projects[0];

  useEffect(() => {
    if (projects.length < 2) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || paused) return;

    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % projects.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [projects.length, paused]);

  const introCopy = content.tagline?.trim() || '';
  const bioCopy = (content.bio || content.tagline || '').replace(/\s+/g, ' ').trim();

  return (
    <section id="hero" className="bento-hero relative z-10">
      <div className="bento-container bento-hero-inner">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bento-board"
        >
          <BentoCard className="bento-area-headline bento-tile p-5 md:p-7 relative flex flex-col justify-center min-h-0 overflow-visible">
            <div className="absolute top-4 right-4 text-[var(--bento-ink-muted)] scale-90 opacity-70">
              <BentoMotif />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] bento-muted mb-2">
              {introCopy ? 'Introduction' : 'Portfolio'}
            </p>
            <h1 className="bento-headline-title pr-10">
              {content.title || content.name}
            </h1>
            {introCopy && (
              <BentoClampText
                text={introCopy}
                lines={4}
                className="mt-3 text-sm md:text-[0.95rem] bento-muted leading-relaxed w-full"
              />
            )}
          </BentoCard>

          <BentoCard className="bento-area-bio bento-tile p-5 md:p-7 flex flex-col gap-3.5 min-h-0 overflow-visible">
            <div className="flex items-start gap-2 shrink-0">
              <BentoMotif className="shrink-0 w-7 h-7 text-[var(--bento-ink-muted)]" />
              {content.yearsExperience && (
                <span className="bento-chip ml-auto shrink-0">{content.yearsExperience}</span>
              )}
            </div>
            {bioCopy && (
              <BentoClampText
                text={bioCopy}
                lines={6}
                className="text-sm leading-relaxed text-[var(--bento-ink-muted)] w-full min-w-0 flex-1"
              />
            )}
            <SocialIconLinks
              content={content}
              size="sm"
              className="mt-auto pt-1 shrink-0"
              linkClassName="text-[var(--bento-ink)] hover:opacity-70 bg-black/5"
            />
          </BentoCard>

          <BentoCard className="bento-area-photo p-0 bento-photo-wrap bento-tile overflow-hidden">
            {content.profileImageUrl ? (
              <img
                src={content.profileImageUrl}
                alt={content.name}
                className="bento-photo"
              />
            ) : (
              <div className="bento-photo flex items-center justify-center text-4xl font-bold bento-muted">
                {initials(content.name) || '?'}
              </div>
            )}
          </BentoCard>

          <BentoCard
            className="bento-area-projects bento-tile p-4 md:p-5 flex flex-col min-h-0 overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false);
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] bento-muted">
                Projects
              </p>
              {projects.length > 1 && (
                <div className="flex items-center gap-1" aria-hidden>
                  {projects.map((p, i) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeIdx ? 'w-4 bg-[var(--bento-ink)]' : 'w-1.5 bg-black/20'
                      }`}
                      aria-label={`Show ${p.title}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {activeProject ? (
              <div className="bento-hero-preview overflow-hidden shrink-0 mb-3">
                <ProjectMediaPreview
                  key={activeProject._id}
                  title={activeProject.title}
                  imageUrl={activeProject.imageUrl}
                  liveUrl={activeProject.liveUrl}
                />
              </div>
            ) : (
              <div className="mb-3 h-56 bg-black/5 flex items-center justify-center text-sm bento-muted rounded-2xl">
                No projects yet
              </div>
            )}

            <ul className="bento-project-list mt-auto space-y-0 overflow-y-auto min-h-0">
              {projects.length === 0 && (
                <li className="py-2 text-sm bento-muted">Add projects in the CMS to feature them here.</li>
              )}
              {projects.map((p, i) => (
                <li key={p._id}>
                  {i > 0 && <hr className="bento-divider" />}
                  <button
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`w-full flex items-center justify-between py-2.5 text-left text-xs sm:text-sm font-semibold transition-colors ${
                      i === activeIdx ? 'text-[var(--bento-ink)]' : 'bento-muted hover:text-[var(--bento-ink)]'
                    }`}
                  >
                    <span className="truncate pr-2">{p.title}</span>
                    {(p.liveUrl || p.githubUrl) && (
                      <a
                        href={p.liveUrl || p.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="opacity-50 hover:opacity-100 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Open ${p.title}`}
                      >
                        ↗
                      </a>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </BentoCard>
        </motion.div>
      </div>
    </section>
  );
}
