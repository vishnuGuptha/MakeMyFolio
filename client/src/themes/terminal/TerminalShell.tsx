import type { ShellProps } from '../types';

export default function TerminalShell({ children }: ShellProps) {
  return (
    <div className="terminal-shell min-h-screen relative">
      <div className="terminal-scanlines" aria-hidden />
      <div className="terminal-grid-bg" aria-hidden />
      {children}
    </div>
  );
}
