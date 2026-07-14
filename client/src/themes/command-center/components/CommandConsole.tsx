import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

function TitleBarStatus({ label }: { label: string }) {
  const parts = label.split(' · ');
  const status = parts[0] || label;
  const detail = parts.slice(1).join(' · ');

  return (
    <span className="cc-titlebar-status">
      <span className="cc-titlebar-status-dot" aria-hidden />
      <span className="cc-titlebar-status-text">
        {status}
        {detail && <span className="cc-titlebar-status-detail"> · {detail}</span>}
      </span>
    </span>
  );
}

export default function CommandConsole({
  title,
  titleVariant = 'default',
  children,
  className,
}: {
  title?: string;
  titleVariant?: 'default' | 'status';
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="cc-console-titlebar">
        <div className="cc-console-window-dots" aria-hidden>
          <span className="cc-console-dot cc-console-dot-red" />
          <span className="cc-console-dot cc-console-dot-yellow" />
          <span className="cc-console-dot cc-console-dot-green" />
        </div>
        {title && titleVariant === 'status' ? (
          <TitleBarStatus label={title} />
        ) : title ? (
          <span className="cc-console-title-label">{title}</span>
        ) : (
          <span />
        )}
      </div>
      <div className="p-5 md:p-6">{children}</div>
    </div>
  );
}
