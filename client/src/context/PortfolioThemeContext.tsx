import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { applyPortfolioTheme, resetDocumentThemeForAdmin, type ThemeSettings } from '@/lib/theme';
import { getPortfolioTheme, type PortfolioThemeDefinition, type PortfolioThemeId } from '@/themes/registry';

const PortfolioThemeContext = createContext<PortfolioThemeDefinition | null>(null);

export function PortfolioThemeProvider({
  themeId,
  settings,
  children,
}: {
  themeId?: PortfolioThemeId | string | null;
  /** When set, colors/fonts apply only on this portfolio root — not the app chrome. */
  settings?: ThemeSettings | null;
  children: ReactNode;
}) {
  const theme = getPortfolioTheme(themeId);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !settings) return;
    applyPortfolioTheme(settings, el);
    return () => {
      resetDocumentThemeForAdmin();
    };
  }, [settings, theme.id]);

  // Studio is dark-only — lock document appearance while this theme is open.
  useEffect(() => {
    if (theme.id !== 'studio') return;
    const root = document.documentElement;
    root.setAttribute('data-studio-force-dark', '1');
    root.classList.remove('light');
    root.classList.add('dark');
    return () => {
      root.removeAttribute('data-studio-force-dark');
      let preferred: 'dark' | 'light' = 'light';
      try {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') preferred = stored;
      } catch {
        /* ignore */
      }
      root.classList.remove('dark', 'light');
      root.classList.add(preferred);
    };
  }, [theme.id]);

  return (
    <PortfolioThemeContext.Provider value={theme}>
      <div
        ref={rootRef}
        data-portfolio-theme={theme.id}
        className="portfolio-theme-root min-h-screen"
      >
        {children}
      </div>
    </PortfolioThemeContext.Provider>
  );
}

export function usePortfolioTheme() {
  const theme = useContext(PortfolioThemeContext);
  if (!theme) throw new Error('usePortfolioTheme must be used within PortfolioThemeProvider');
  return theme;
}
