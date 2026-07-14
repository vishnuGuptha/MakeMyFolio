import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useShowSectionNumbers } from '@/context/PortfolioContext';

export function TerminalContainer({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mx-auto max-w-6xl px-4 sm:px-6', className)}>{children}</div>;
}

export function TerminalSection({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('py-16 md:py-20 scroll-mt-20', className)}>
      {children}
    </section>
  );
}

export function TerminalHeading({
  number,
  title,
  command,
}: {
  number?: string;
  title: string;
  command?: string;
}) {
  const showNumber = useShowSectionNumbers();

  return (
    <div className="mb-8 font-mono">
      {showNumber && number && (
        <p className="text-xs text-accent mb-1"># section {number}</p>
      )}
      <p className="text-sm text-subtle mb-1">
        <span className="text-accent">$</span> {command || `cd ~/${title.toLowerCase().replace(/\s+/g, '-')}`}
      </p>
      <h2 className="text-xl md:text-2xl font-bold text-primary">{title}</h2>
    </div>
  );
}
