import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import type { ShellProps } from '../types';
import { usePortfolioData } from '@/context/PortfolioContext';
import SpotlightCommandPalette from './components/SpotlightCommandPalette';

export default function SpotlightShell({ children }: ShellProps) {
  const reduceMotion = useReducedMotion();
  const { profile, content, settings } = usePortfolioData();
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      if (!reduceMotion) {
        setProgress(max > 0 ? el.scrollTop / max : 0);
      }
      setShowTop(window.scrollY > 500);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduceMotion]);

  return (
    <div className="min-h-screen spotlight-shell relative">
      {!reduceMotion ? (
        <div
          className="spotlight-scroll-progress"
          style={{ transform: `scaleX(${progress})` }}
          aria-hidden
        />
      ) : null}
      <div className="spotlight-aurora" aria-hidden />
      <div className="spotlight-grid" aria-hidden />
      <div className="spotlight-dots" aria-hidden />
      <div className="spotlight-noise" aria-hidden />
      {children}
      {showTop ? (
        <div className="spotlight-fab-stack" role="group" aria-label="Quick actions">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="spotlight-sticky-top"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      ) : null}
      <SpotlightCommandPalette
        slug={profile?.slug}
        resumeUrl={content?.resumeUrl}
        sectionVisibility={settings?.sectionVisibility}
      />
    </div>
  );
}
