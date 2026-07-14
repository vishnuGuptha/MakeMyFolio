import { usePortfolioTheme } from '@/context/PortfolioThemeContext';
import type { NavbarProps } from './types';

export default function ThemeNavbar(props: NavbarProps) {
  const { components } = usePortfolioTheme();
  const Navbar = components.Navbar;
  return <Navbar {...props} />;
}
