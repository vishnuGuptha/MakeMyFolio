import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { Container } from '@/components/layout/Section';
import type { FooterProps } from '../types';

export default function GlassFooter({ content }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border py-8">
      <Container className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-subtle">
        <p>© {year} {content.name}. Built with React & TypeScript.</p>
        <SocialIconLinks
          content={content}
          size="sm"
          linkClassName="text-subtle hover:text-accent bg-muted/40 hover:bg-muted/70"
        />
      </Container>
    </footer>
  );
}
