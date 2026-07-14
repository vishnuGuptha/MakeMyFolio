import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import type { FooterProps } from '../types';

export default function BentoFooter({ content }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="py-10 mt-4">
      <div className="bento-container flex flex-col sm:flex-row items-center justify-between gap-3 text-sm bento-muted">
        <p className="font-semibold tracking-wide uppercase text-xs text-[var(--bento-ink)]">
          {content.name}
        </p>
        <SocialIconLinks
          content={content}
          size="sm"
          linkClassName="text-[var(--bento-ink-muted)] hover:text-[var(--bento-ink)] bg-black/5 hover:bg-black/10"
        />
        <p>© {year}</p>
      </div>
    </footer>
  );
}
