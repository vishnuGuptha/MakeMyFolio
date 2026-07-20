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
