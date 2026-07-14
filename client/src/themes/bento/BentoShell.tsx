import { useEffect } from 'react';
import type { ShellProps } from '../types';

/** Soft Bento is light-only — keep html in light mode even if ThemeContext prefers dark. */
export default function BentoShell({ children }: ShellProps) {
  useEffect(() => {
    const root = document.documentElement;
    const forceLight = () => {
      root.classList.remove('dark');
      root.classList.add('light');
    };

    forceLight();

    const observer = new MutationObserver(() => {
      if (root.classList.contains('dark')) forceLight();
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  return <div className="bento-shell min-h-screen">{children}</div>;
}
