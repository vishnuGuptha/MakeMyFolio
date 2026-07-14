import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useShowSectionNumbers } from '@/context/PortfolioContext';

export function SpotlightContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto max-w-6xl px-6', className)}>{children}</div>;
}

export function SpotlightSection({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('py-20 scroll-mt-20', className)}>
      {children}
    </section>
  );
}

export function SpotlightHeading({
  number,
  title,
  subtitle,
}: {
  number?: string;
  title: string;
  subtitle?: string;
}) {
  const showNumber = useShowSectionNumbers();

  return (
    <div className="mb-12">
      {showNumber && number && (
        <span className="font-mono text-xs text-accent tracking-widest uppercase">{number}</span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-primary mt-1 spotlight-heading-title">{title}</h2>
      <div className="h-1 w-16 bg-accent mt-3 rounded-full" />
      {subtitle && <p className="text-subtle mt-3 max-w-xl">{subtitle}</p>}
    </div>
  );
}
