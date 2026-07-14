import { usePortfolioTheme } from '@/context/PortfolioThemeContext';
import type { SectionWrapperProps } from './types';

export default function ThemeSectionWrapper(props: SectionWrapperProps) {
  const { components } = usePortfolioTheme();
  const SectionWrapper = components.SectionWrapper;
  return <SectionWrapper {...props} />;
}
