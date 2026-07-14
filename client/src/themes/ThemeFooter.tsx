import { usePortfolioTheme } from '@/context/PortfolioThemeContext';
import type { FooterProps } from './types';

export default function ThemeFooter(props: FooterProps) {
  const { components } = usePortfolioTheme();
  const Footer = components.Footer;
  return <Footer {...props} />;
}
