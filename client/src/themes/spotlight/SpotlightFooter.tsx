import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { SpotlightContainer } from './layout/SpotlightSection';
import SpotlightShareMoment from './components/SpotlightShareMoment';
import type { FooterProps } from '../types';

export default function SpotlightFooter({ content }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="spotlight-footer relative z-10 border-t py-8 mt-4">
      <SpotlightContainer className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <p className="text-subtle">© {year} {content.name}. All rights reserved.</p>
          <SpotlightShareMoment name={content.name} />
        </div>
        <SocialIconLinks
          content={content}
          size="sm"
          linkClassName="text-subtle hover:text-accent border border-border/60 hover:border-accent/40"
        />
      </SpotlightContainer>
    </footer>
  );
}
