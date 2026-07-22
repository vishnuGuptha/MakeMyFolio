import type { Variants, Transition } from 'framer-motion';

/** Shared Spotlight motion tokens — keep reveals varied but consistent. */
export const spotlightEase = [0.22, 1, 0.36, 1] as const;

export const spotlightTransition: Transition = {
  duration: 0.5,
  ease: spotlightEase,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: spotlightTransition },
};

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: spotlightTransition },
};

export const fadeSlideLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0, transition: spotlightTransition },
};

export const staggerChildren = (stagger = 0.08): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
});

/** Map free-text skill levels to 0–100 for proficiency rings. */
export { skillLevelPercent } from '@/themes/shared/skills/skillLevelPercent';
