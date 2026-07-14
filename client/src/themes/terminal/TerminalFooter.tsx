import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { TerminalContainer } from './layout/TerminalSection';
import type { FooterProps } from '../types';

export default function TerminalFooter({ content }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="terminal-footer relative z-10 border-t py-6 mt-4">
      <TerminalContainer className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm text-subtle">
        <p>
          <span className="text-accent">$</span> echo &quot;© {year} {content.name} | exit 0 | Portfolio CMS&quot;
        </p>
        <SocialIconLinks
          content={content}
          size="sm"
          linkClassName="text-subtle hover:text-accent border border-border/50 hover:border-accent/50"
        />
      </TerminalContainer>
    </footer>
  );
}
