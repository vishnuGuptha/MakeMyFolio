import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function TerminalWindow({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('terminal-window overflow-hidden', className)}>
      <div className="terminal-titlebar flex items-center gap-2 px-3 py-2">
        <span className="terminal-dot terminal-dot-red" aria-hidden />
        <span className="terminal-dot terminal-dot-yellow" aria-hidden />
        <span className="terminal-dot terminal-dot-green" aria-hidden />
        <span className="text-xs text-subtle ml-2 truncate font-mono">{title}</span>
      </div>
      <div className="terminal-body p-4 md:p-5 font-mono text-sm overflow-x-auto">{children}</div>
    </div>
  );
}
