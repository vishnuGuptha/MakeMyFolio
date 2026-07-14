import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import type { FooterProps } from '../types';

export default function OliveFooter({ content }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="olive-footer">
      <div className="olive-footer-row">
        <SocialIconLinks
          content={content}
          size="sm"
          linkClassName="olive-icon-btn !h-8 !w-8 !text-inherit"
        />
      </div>
      <p>
        © {year} {content.name || 'Portfolio'}. All rights reserved.
      </p>
    </footer>
  );
}
