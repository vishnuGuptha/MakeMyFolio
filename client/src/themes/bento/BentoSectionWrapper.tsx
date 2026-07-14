import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SectionWrapperProps } from '../types';

export default function BentoSectionWrapper({ children, id, className }: SectionWrapperProps) {
  return (
    <div id={id} className={cn('py-10 md:py-14', className)}>
      {children}
    </div>
  );
}

export function BentoSection({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="py-10 md:py-14">
      <div className="bento-container">
        {label && <p className="bento-section-label">{label}</p>}
        <h2 className="bento-section-title">{title}</h2>
        {children}
      </div>
    </section>
  );
}
