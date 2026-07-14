export const FONT_OPTIONS = [
  { id: 'dm-sans', label: 'DM Sans', family: "'DM Sans', system-ui, sans-serif", google: 'DM+Sans:wght@400;500;600;700' },
  { id: 'inter', label: 'Inter', family: "'Inter', system-ui, sans-serif", google: 'Inter:wght@400;500;600;700' },
  { id: 'poppins', label: 'Poppins', family: "'Poppins', system-ui, sans-serif", google: 'Poppins:wght@400;500;600;700' },
  { id: 'space-grotesk', label: 'Space Grotesk', family: "'Space Grotesk', system-ui, sans-serif", google: 'Space+Grotesk:wght@400;500;600;700' },
  { id: 'playfair', label: 'Playfair Display', family: "'Playfair Display', Georgia, serif", google: 'Playfair+Display:wght@400;600;700' },
  { id: 'jetbrains-mono', label: 'JetBrains Mono', family: "'JetBrains Mono', monospace", google: 'JetBrains+Mono:wght@400;500;600' },
] as const;

export type FontId = (typeof FONT_OPTIONS)[number]['id'];
export type LayoutMode = 'single-page' | 'multi-page';
export type GlassStyle = 'subtle' | 'medium' | 'strong';

/** Curated primary + secondary pairs — bright accents with soft companion washes. */
export const COLOR_PALETTE_OPTIONS = [
  {
    id: 'teal-lagoon',
    label: 'Teal Lagoon',
    description: 'Soft Bento default — vivid teal on mint mist',
    primary: '#14B8A6',
    secondary: '#CCFBF1',
  },
  {
    id: 'sky-breeze',
    label: 'Sky Breeze',
    description: 'Bright sky blue with powder-blue wash',
    primary: '#0EA5E9',
    secondary: '#E0F2FE',
  },
  {
    id: 'coral-sunrise',
    label: 'Coral Sunrise',
    description: 'Fresh rose coral on soft blush',
    primary: '#FB7185',
    secondary: '#FFE4E6',
  },
  {
    id: 'violet-bloom',
    label: 'Violet Bloom',
    description: 'Electric violet with lilac mist',
    primary: '#8B5CF6',
    secondary: '#EDE9FE',
  },
  {
    id: 'citrus-pop',
    label: 'Citrus Pop',
    description: 'Sunny amber on warm cream',
    primary: '#F59E0B',
    secondary: '#FEF3C7',
  },
  {
    id: 'mint-fresh',
    label: 'Mint Fresh',
    description: 'Lively emerald with cool mint',
    primary: '#10B981',
    secondary: '#D1FAE5',
  },
  {
    id: 'blueberry',
    label: 'Blueberry',
    description: 'Clear royal blue and icy blue',
    primary: '#3B82F6',
    secondary: '#DBEAFE',
  },
  {
    id: 'peach-cream',
    label: 'Peach Cream',
    description: 'Warm orange accent on peach foam',
    primary: '#F97316',
    secondary: '#FFEDD5',
  },
  {
    id: 'fuchsia-dream',
    label: 'Fuchsia Dream',
    description: 'Bright fuchsia with soft orchid',
    primary: '#D946EF',
    secondary: '#FAE8FF',
  },
  {
    id: 'lime-spark',
    label: 'Lime Spark',
    description: 'Zesty lime on pale chartreuse',
    primary: '#84CC16',
    secondary: '#ECFCCB',
  },
  {
    id: 'ocean-glass',
    label: 'Ocean Glass',
    description: 'Cyan glass with glacier aqua',
    primary: '#06B6D4',
    secondary: '#CFFAFE',
  },
  {
    id: 'cherry-soft',
    label: 'Cherry Soft',
    description: 'Bold cherry red on petal pink',
    primary: '#F43F5E',
    secondary: '#FFE4E6',
  },
] as const;

export type ColorPaletteId = (typeof COLOR_PALETTE_OPTIONS)[number]['id'];

export function findMatchingColorPalette(primary?: string, secondary?: string) {
  const p = (primary || '').toLowerCase();
  const s = (secondary || '').toLowerCase();
  return COLOR_PALETTE_OPTIONS.find(
    (palette) => palette.primary.toLowerCase() === p && palette.secondary.toLowerCase() === s
  );
}

export const PORTFOLIO_NAV_SECTIONS = [
  { id: 'about', label: 'About', path: 'about' },
  { id: 'skills', label: 'Skills', path: 'skills' },
  { id: 'experience', label: 'Experience', path: 'experience' },
  { id: 'projects', label: 'Projects', path: 'projects' },
  { id: 'education', label: 'Education', path: 'education' },
  { id: 'certifications', label: 'Certifications', path: 'certifications' },
  { id: 'contact', label: 'Contact', path: 'contact' },
] as const;

export type NavSectionId = (typeof PORTFOLIO_NAV_SECTIONS)[number]['id'];

export type PortfolioThemeId =
  | 'glass'
  | 'spotlight'
  | 'terminal'
  | 'command-center'
  | 'bento'
  | 'studio'
  | 'olive';

export interface ThemeSettings {
  accentColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: FontId | string;
  layoutMode?: LayoutMode;
  glassStyle?: GlassStyle;
  portfolioTheme?: PortfolioThemeId;
  sectionVisibility?: Record<string, boolean>;
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '99 102 241';
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
  const b = Math.min(255, (num & 0x0000ff) + percent);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function applyPortfolioTheme(settings?: ThemeSettings | null) {
  if (!settings) return;

  const primary = settings.primaryColor || settings.accentColor || '#6366f1';
  const secondary = settings.secondaryColor || '#22d3ee';

  document.documentElement.style.setProperty('--accent', hexToRgb(primary));
  document.documentElement.style.setProperty('--primary', hexToRgb(primary));
  document.documentElement.style.setProperty('--accent-hover', hexToRgb(adjustBrightness(primary, 20)));
  document.documentElement.style.setProperty('--secondary', hexToRgb(secondary));
  document.documentElement.style.setProperty('--secondary-hover', hexToRgb(adjustBrightness(secondary, 15)));

  const font = FONT_OPTIONS.find((f) => f.id === settings.fontFamily) || FONT_OPTIONS[0];
  // Keep the CSS variable as a full font stack so `font-family: var(--portfolio-font)` works.
  document.documentElement.style.setProperty('--portfolio-font', font.family);
  document.documentElement.style.setProperty('font-family', font.family);
  document.body.style.setProperty('font-family', font.family);

  ensureGoogleFontLoaded(font.google);

  const glass = settings.glassStyle || 'medium';
  document.documentElement.setAttribute('data-glass', glass);

  const portfolioTheme = settings.portfolioTheme || 'glass';
  document.documentElement.setAttribute('data-portfolio-theme', portfolioTheme);
}

/** Load (or swap) the Google Font stylesheet used by portfolio themes. */
export function ensureGoogleFontLoaded(googleFamily: string) {
  const linkId = 'portfolio-google-font';
  let link = document.getElementById(linkId) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  // Encode so weight separators (;) are not mangled in the href.
  const family = encodeURIComponent(googleFamily).replace(/%2B/g, '+');
  link.href = `https://fonts.googleapis.com/css2?family=${family}&display=swap`;
}

export function getVisibleNavSections(sectionVisibility?: Record<string, boolean>) {
  return PORTFOLIO_NAV_SECTIONS.filter((s) => sectionVisibility?.[s.id] !== false);
}

// backward compat
export function applyAccentColor(color: string) {
  applyPortfolioTheme({ accentColor: color });
}

/** Clear portfolio theme tokens from the document so the admin CMS chrome stays stable. */
export function resetDocumentThemeForAdmin() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  for (const prop of [
    '--accent',
    '--primary',
    '--accent-hover',
    '--secondary',
    '--secondary-hover',
    '--portfolio-font',
  ]) {
    root.style.removeProperty(prop);
  }
  root.style.removeProperty('font-family');
  root.removeAttribute('data-glass');
  root.removeAttribute('data-portfolio-theme');
  document.body.style.removeProperty('font-family');
}
