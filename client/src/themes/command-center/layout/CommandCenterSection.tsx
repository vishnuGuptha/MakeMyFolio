import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useShowSectionNumbers } from '@/context/PortfolioContext';

export function CommandCenterContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto max-w-6xl px-4 sm:px-6', className)}>{children}</div>;
}

export function CommandCenterSection({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('py-8 md:py-12 scroll-mt-28', className)}>
      {children}
    </section>
  );
}

export function CommandCenterHeading({
  number,
  title,
}: {
  number?: string;
  title: string;
}) {
  const showNumber = useShowSectionNumbers();
  const slug = title.toUpperCase().replace(/\s+/g, '_');

  return (
    <div className="mb-6">
      {showNumber && number && (
        <p className="text-xs text-subtle mb-2">{number}</p>
      )}
      <p className="cc-section-label mb-2">_{slug}</p>
      <h2 className="text-2xl md:text-3xl font-bold text-primary">{title}</h2>
    </div>
  );
}
