import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function BentoArrowLink({
  children,
  className,
  href,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const classes = cn(
    'inline-flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80',
    className
  );

  if (href) {
    return (
      <a href={href} className={classes} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>
        {children}
        <span aria-hidden>↗</span>
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
      <span aria-hidden>↗</span>
    </button>
  );
}
