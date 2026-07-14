import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useShowSectionNumbers } from '@/context/PortfolioContext';

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto max-w-5xl px-6', className)}>{children}</div>;
}

export function Section({
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

export function SectionHeading({
  number,
  title,
  showNumber,
}: {
  number: string;
  title: string;
  showNumber?: boolean;
}) {
  const showByLayout = useShowSectionNumbers();
  const displayNumber = showNumber ?? showByLayout;

  return (
    <div className="mb-12 flex items-center gap-4">
      {displayNumber && <span className="font-mono text-accent text-sm">{number}.</span>}
      <h2 className="text-2xl font-bold text-primary">{title}</h2>
      <div className="h-px flex-1 bg-border max-w-xs" />
    </div>
  );
}
