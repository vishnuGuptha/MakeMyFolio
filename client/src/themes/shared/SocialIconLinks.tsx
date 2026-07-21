import { Github, Linkedin, Mail, Globe, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import type { ProfileContent } from '@/types';

export type SocialLinkItem = {
  id: 'linkedin' | 'github' | 'email' | 'portfolio' | 'phone';
  label: string;
  href: string;
  external?: boolean;
};

/** Build social / contact links from profile content (skips empty values). */
export function getSocialLinks(
  content: Pick<ProfileContent, 'linkedin' | 'github' | 'email' | 'portfolioUrl' | 'phone'>,
  opts?: { includePhone?: boolean }
): SocialLinkItem[] {
  const links: SocialLinkItem[] = [];
  if (content.linkedin?.trim()) {
    links.push({ id: 'linkedin', label: 'LinkedIn', href: content.linkedin.trim(), external: true });
  }
  if (content.github?.trim()) {
    links.push({ id: 'github', label: 'GitHub', href: content.github.trim(), external: true });
  }
  if (content.email?.trim()) {
    links.push({ id: 'email', label: 'Email', href: `mailto:${content.email.trim()}` });
  }
  if (content.portfolioUrl?.trim()) {
    links.push({
      id: 'portfolio',
      label: 'Portfolio',
      href: content.portfolioUrl.trim(),
      external: true,
    });
  }
  if (opts?.includePhone && content.phone?.trim()) {
    links.push({ id: 'phone', label: 'Phone', href: `tel:${content.phone.trim()}` });
  }
  return links;
}

const ICONS = {
  linkedin: Linkedin,
  github: Github,
  email: Mail,
  portfolio: Globe,
  phone: Phone,
} as const;

type Size = 'sm' | 'md' | 'lg';

const SIZE: Record<Size, { wrap: string; icon: string }> = {
  sm: { wrap: 'h-8 w-8', icon: 'h-3.5 w-3.5' },
  md: { wrap: 'h-9 w-9', icon: 'h-4 w-4' },
  lg: { wrap: 'h-10 w-10', icon: 'h-5 w-5' },
};

export default function SocialIconLinks({
  content,
  className,
  linkClassName,
  size = 'md',
  includePhone = false,
  exclude,
}: {
  content: Pick<ProfileContent, 'linkedin' | 'github' | 'email' | 'portfolioUrl' | 'phone'>;
  className?: string;
  linkClassName?: string;
  size?: Size;
  includePhone?: boolean;
  /** Hide specific platforms (e.g. email already shown elsewhere). */
  exclude?: SocialLinkItem['id'][];
}) {
  const links = getSocialLinks(content, { includePhone }).filter(
    (l) => !exclude?.includes(l.id)
  );
  if (!links.length) return null;

  const dims = SIZE[size];

  return (
    <nav className={cn('flex flex-wrap items-center gap-2', className)} aria-label="Social links">
      {links.map((link) => {
        const Icon = ICONS[link.id];
        return (
          <Tooltip key={link.id} content={link.label}>
            <a
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              aria-label={link.label}
              className={cn(
                'inline-flex items-center justify-center rounded-full transition-colors',
                dims.wrap,
                linkClassName
              )}
            >
              <Icon className={dims.icon} aria-hidden />
            </a>
          </Tooltip>
        );
      })}
    </nav>
  );
}
