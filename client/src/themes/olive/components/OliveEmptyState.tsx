import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function OliveEmptyState({
  title,
  hint,
  className,
}: {
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn('olive-empty', className)} role="status">
      <p className="font-semibold text-white/90">{title}</p>
      {hint ? <p className="mt-1.5 text-sm opacity-80">{hint}</p> : null}
    </div>
  );
}

export function OliveSkillCard({
  title,
  description,
  icon,
  variant = 'slate',
}: {
  title: string;
  description: string;
  icon: ReactNode;
  variant?: 'accent' | 'slate';
}) {
  return (
    <article
      className={cn(
        'olive-skill-card',
        variant === 'accent' && 'olive-skill-card-accent',
        variant === 'slate' && 'olive-skill-card-slate'
      )}
    >
      <div className="olive-skill-icon" aria-hidden>
        {icon}
      </div>
      <h3 className="olive-skill-title">{title}</h3>
      <p className="olive-skill-desc">{description}</p>
    </article>
  );
}

