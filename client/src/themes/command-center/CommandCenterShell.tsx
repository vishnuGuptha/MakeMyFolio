import { useEffect } from 'react';
import type { ShellProps } from '../types';
import ParticleField from './components/ParticleField';
import { useScrollGlow } from './hooks/useScrollGlow';

export default function CommandCenterShell({ children }: ShellProps) {
  const glowOpacity = useScrollGlow();

  useEffect(() => {
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="cc-shell min-h-screen relative">
      <div className="cc-grid-bg" aria-hidden />
      <ParticleField />
      <div
        className="cc-hero-glow"
        aria-hidden
        style={{ opacity: glowOpacity }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
