import type { SkillsDisplayStyle } from '@/types';
import type { PortfolioThemeId } from '@/lib/theme';

export type { SkillsDisplayStyle };

export const SKILLS_DISPLAY_STYLE_OPTIONS: {
  id: SkillsDisplayStyle;
  label: string;
  description: string;
}[] = [
  { id: 'chips', label: 'Chips / tags', description: 'Wrapped pills under each category' },
  { id: 'rings', label: 'Proficiency rings', description: 'Circular meters from skill levels' },
  { id: 'bars', label: 'Progress bars', description: 'Name plus filled bar per skill' },
  { id: 'cards', label: 'Category cards', description: 'One card per category with skills inside' },
];

const THEME_DEFAULT_STYLE: Record<PortfolioThemeId, SkillsDisplayStyle> = {
  glass: 'chips',
  spotlight: 'rings',
  terminal: 'bars',
  'command-center': 'bars',
  bento: 'chips',
  studio: 'chips',
  olive: 'cards',
};

const VALID: SkillsDisplayStyle[] = ['chips', 'rings', 'bars', 'cards'];

export function resolveSkillsDisplayStyle(
  themeId: PortfolioThemeId | string | undefined,
  setting?: SkillsDisplayStyle | string | null
): SkillsDisplayStyle {
  if (setting && VALID.includes(setting as SkillsDisplayStyle)) {
    return setting as SkillsDisplayStyle;
  }
  const id = (themeId || 'glass') as PortfolioThemeId;
  return THEME_DEFAULT_STYLE[id] ?? 'chips';
}

export function defaultSkillsDisplayStyleForTheme(
  themeId: PortfolioThemeId | string | undefined
): SkillsDisplayStyle {
  return resolveSkillsDisplayStyle(themeId, null);
}
