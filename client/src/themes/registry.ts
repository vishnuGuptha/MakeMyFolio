/**
 * Portfolio theme registry.
 *
 * To add a new theme:
 * 1. Create themes/{id}/ with config.ts, components, and optional CSS
 * 2. Register the theme in PORTFOLIO_THEMES below
 * 3. Add the id to PortfolioThemeId in types.ts and server SiteSettings enum
 * 4. Add a preview asset in public/theme-previews/
 */
import type { PortfolioThemeDefinition, PortfolioThemeId } from './types';
import { glassTheme } from './glass/config';
import { spotlightTheme } from './spotlight/config';
import { terminalTheme } from './terminal/config';
import { commandCenterTheme } from './command-center/config';
import { bentoTheme } from './bento/config';
import { studioTheme } from './studio/config';
import { oliveTheme } from './olive/config';

export const PORTFOLIO_THEMES: Record<PortfolioThemeId, PortfolioThemeDefinition> = {
  glass: glassTheme,
  spotlight: spotlightTheme,
  terminal: terminalTheme,
  'command-center': commandCenterTheme,
  bento: bentoTheme,
  studio: studioTheme,
  olive: oliveTheme,
};

export const PORTFOLIO_THEME_LIST = Object.values(PORTFOLIO_THEMES);

export function getPortfolioTheme(id?: PortfolioThemeId | string | null): PortfolioThemeDefinition {
  if (id && id in PORTFOLIO_THEMES) {
    return PORTFOLIO_THEMES[id as PortfolioThemeId];
  }
  return PORTFOLIO_THEMES.glass;
}

export type { PortfolioThemeId, PortfolioThemeDefinition } from './types';
