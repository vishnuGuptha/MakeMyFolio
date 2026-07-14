import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type OlivePanelMode = 'island' | 'flush-start' | 'flush-end' | 'bare';

export default function OliveSection({
  id,
  className,
  panel = 'island',
  children,
}: {
  id?: string;
  className?: string;
  panel?: OlivePanelMode;
  children: ReactNode;
}) {
  const isBare = panel === 'bare';

  return (
    <section
      id={id}
      className={cn('olive-section', isBare && 'olive-section-bare', className)}
    >
      {isBare ? (
        <div className="olive-rail">{children}</div>
      ) : (
        <div
          className={cn(
            panel === 'island' && 'olive-panel-island',
            panel === 'flush-start' && 'olive-panel-flush-start',
            panel === 'flush-end' && 'olive-panel-flush-end'
          )}
        >
          <div className="olive-rail">{children}</div>
        </div>
      )}
    </section>
  );
}

export function OliveSectionHeader({
  title,
  lead,
  withColon = true,
}: {
  title: string;
  lead?: string;
  withColon?: boolean;
}) {
  const label = withColon && !title.trim().endsWith(':') ? `${title}:` : title;
  return (
    <div className="olive-section-head">
      <h2 className="olive-section-title">{label}</h2>
      {lead ? <p className="olive-section-lead">{lead}</p> : null}
    </div>
  );
}
