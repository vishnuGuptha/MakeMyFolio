import type { ShellProps } from '../types';

export default function SpotlightShell({ children }: ShellProps) {
  return (
    <div className="min-h-screen spotlight-shell relative">
      <div className="spotlight-grid" aria-hidden />
      <div className="spotlight-dots" aria-hidden />
      {children}
    </div>
  );
}
