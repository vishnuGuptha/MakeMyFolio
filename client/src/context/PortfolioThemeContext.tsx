import { createContext, useContext, type ReactNode } from 'react';
import { getPortfolioTheme, type PortfolioThemeDefinition, type PortfolioThemeId } from '@/themes/registry';

const PortfolioThemeContext = createContext<PortfolioThemeDefinition | null>(null);

export function PortfolioThemeProvider({
  themeId,
  children,
}: {
  themeId?: PortfolioThemeId | string | null;
  children: ReactNode;
}) {
  const theme = getPortfolioTheme(themeId);

  return (
    <PortfolioThemeContext.Provider value={theme}>
      <div data-portfolio-theme={theme.id} className="portfolio-theme-root">
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
