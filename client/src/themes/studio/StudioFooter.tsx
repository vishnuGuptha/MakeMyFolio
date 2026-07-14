import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import type { FooterProps } from '../types';

export default function StudioFooter({ content }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="studio-footer">
      <div className="studio-container flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>
          Made with <span aria-hidden>❤️</span>
          {content?.name ? ` · ${content.name}` : ''} · {year}
        </p>
        <SocialIconLinks
          content={content}
          size="sm"
          linkClassName="text-[var(--studio-muted)] hover:text-[var(--studio-ink)] border border-[var(--studio-border)] hover:border-[var(--studio-accent)]"
        />
      </div>
    </footer>
  );
}
