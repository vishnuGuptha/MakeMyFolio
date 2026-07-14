import { usePortfolioTheme } from '@/context/PortfolioThemeContext';
import { usePortfolioData } from '@/context/PortfolioContext';
import CursorEffect from './shared/CursorEffect';
import { resolveCursorEffect } from './shared/cursorEffects';
import type { ShellProps } from './types';

export default function ThemeShell({ children }: ShellProps) {
  const { components } = usePortfolioTheme();
  const { settings } = usePortfolioData();
  const Shell = components.Shell;
  const cursorEffect = resolveCursorEffect(settings);

  return (
    <Shell>
      {children}
      {cursorEffect !== 'none' && (
        <div className="portfolio-cursor-layer" aria-hidden>
          <CursorEffect />
        </div>
      )}
    </Shell>
  );
}
