import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type BentoCardProps = {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'soft' | 'cta';
  interactive?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export default function BentoCard({
  children,
  className,
  variant = 'default',
  interactive = false,
  ...rest
}: BentoCardProps) {
  const variantClass =
    variant === 'cta' ? 'bento-card-cta' : variant === 'soft' ? 'bento-card-soft' : '';

  return (
    <div
      className={cn(
        'bento-card overflow-hidden',
        variantClass,
        interactive && 'bento-card-interactive',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
