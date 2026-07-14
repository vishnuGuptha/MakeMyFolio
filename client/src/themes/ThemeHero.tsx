import { usePortfolioTheme } from '@/context/PortfolioThemeContext';
import type { HeroProps } from './types';

export default function ThemeHero(props: HeroProps) {
  const { components } = usePortfolioTheme();
  const Hero = components.Hero;
  return <Hero {...props} />;
}
