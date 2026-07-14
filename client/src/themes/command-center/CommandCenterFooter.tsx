import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { CommandCenterContainer } from './layout/CommandCenterSection';
import type { FooterProps } from '../types';

export default function CommandCenterFooter({ content }: FooterProps) {
  const [showTop, setShowTop] = useState(false);
  const year = new Date().getFullYear();
  const tagline = content.tagline || 'Creating intelligent solutions for a better tomorrow.';

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <footer className="relative z-10 py-12 border-t border-white/5">
      <CommandCenterContainer className="text-center space-y-4">
        <p className="text-sm text-primary font-mono">
          &lt;/&gt; Designed &amp; Built by <span className="text-accent">{content.name}</span>
        </p>
        <p className="text-xs text-subtle">{tagline}</p>
        <SocialIconLinks
          content={content}
          size="sm"
          className="justify-center"
          linkClassName="text-subtle hover:text-accent bg-white/5 hover:bg-white/10"
        />
        <p className="text-[10px] text-subtle">© {year} · Portfolio CMS</p>
      </CommandCenterContainer>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 cc-glass-card p-3 rounded-full hover:scale-105 transition-transform"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4 text-accent" />
        </button>
      )}
    </footer>
  );
}
