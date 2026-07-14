import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={cn('cc-glass-card p-5 md:p-6', !hover && 'cc-glass-card-static', className)}>
      {children}
    </div>
  );
}
