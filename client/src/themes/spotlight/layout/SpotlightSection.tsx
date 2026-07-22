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
    <section id={id} className={cn('py-10 md:py-12 scroll-mt-20', className)}>
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
    <div className="mb-7 md:mb-8">
      {showNumber && number && (
        <span className="font-mono text-xs text-accent tracking-widest uppercase">{number}</span>
      )}
      <h2
        className={cn(
          'text-3xl md:text-4xl font-bold text-primary spotlight-heading-title',
          showNumber && number ? 'mt-1' : 'mt-0'
        )}
      >
        {title}
      </h2>
      <div className="h-1 w-16 bg-accent mt-3 rounded-full" />
      {subtitle && <p className="text-subtle mt-3 max-w-xl">{subtitle}</p>}
    </div>
  );
}
