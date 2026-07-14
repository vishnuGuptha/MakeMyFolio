import type { ShellProps } from '../types';

export default function GlassShell({ children }: ShellProps) {
  return (
    <div className="min-h-screen bg-base gradient-mesh-bg relative">
      <div className="glass-orb glass-orb-primary" aria-hidden />
      <div className="glass-orb glass-orb-secondary" aria-hidden />
      {children}
    </div>
  );
}
