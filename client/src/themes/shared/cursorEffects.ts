export type CursorEffectId =
  | 'none'
  | 'spotlight'
  | 'glow'
  | 'follower'
  | 'radial-gradient'
  | 'lighting'
  | 'aura'
  | 'hover-spotlight';

export const CURSOR_EFFECT_OPTIONS: {
  id: CursorEffectId;
  label: string;
  description: string;
}[] = [
  { id: 'none', label: 'None', description: 'No cursor effect' },
  {
    id: 'spotlight',
    label: 'Cursor Spotlight',
    description: 'A soft radial light follows the mouse, like a flashlight across the page',
  },
  {
    id: 'glow',
    label: 'Cursor Glow',
    description: 'A blurred glowing circle follows the cursor',
  },
  {
    id: 'follower',
    label: 'Mouse Follower',
    description: 'A ring and dot track the cursor with a subtle delay',
  },
  {
    id: 'radial-gradient',
    label: 'Radial Gradient Cursor',
    description: 'A page-wide radial gradient centered at the mouse position',
  },
  {
    id: 'lighting',
    label: 'Interactive Lighting',
    description: 'The page appears illuminated around the cursor',
  },
  {
    id: 'aura',
    label: 'Cursor Aura',
    description: 'A large soft glowing halo around the cursor',
  },
  {
    id: 'hover-spotlight',
    label: 'Hover Spotlight',
    description: 'Spotlight intensifies over links, buttons, and inputs',
  },
];

export function resolveCursorEffect(settings?: {
  cursorEffect?: CursorEffectId | string | null;
  showCursorGlow?: boolean;
} | null): CursorEffectId {
  const effect = settings?.cursorEffect;
  if (effect && effect !== 'none') {
    return effect as CursorEffectId;
  }
  if (settings?.showCursorGlow) return 'glow';
  return 'none';
}
