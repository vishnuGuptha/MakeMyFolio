import { cn } from '@/lib/utils';

export function Badge({
  children,
  className,
  variant = 'default',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'outline';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-medium',
        variant === 'default' && 'bg-muted text-secondary',
        variant === 'accent' && 'bg-accent/20 text-accent',
        variant === 'outline' && 'border border-border text-subtle',
        className
      )}
    >
      {children}
    </span>
  );
}
