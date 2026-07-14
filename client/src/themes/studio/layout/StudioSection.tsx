import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function StudioSection({
  id,
  band = 'light',
  className,
  children,
}: {
  id?: string;
  band?: 'light' | 'dark';
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        'studio-section',
        band === 'dark' ? 'studio-band-dark' : 'studio-band-light',
        className
      )}
    >
      <div className="studio-container">{children}</div>
    </section>
  );
}

export function StudioSectionHeader({
  title,
  lead,
}: {
  title: string;
  lead?: string;
}) {
  return (
    <div className="studio-section-head">
      <h2 className="studio-section-title">{title}</h2>
      {lead && <p className="studio-section-lead">{lead}</p>}
    </div>
  );
}
