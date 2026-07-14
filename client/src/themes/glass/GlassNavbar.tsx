import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { Container } from '@/components/layout/Section';
import { getVisibleNavSections } from '@/lib/theme';
import type { NavbarProps } from '../types';

export default function GlassNavbar({ name, slug, basePath: basePathProp, layoutMode, sectionVisibility }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('');
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navItems = getVisibleNavSections(sectionVisibility);
  const basePath = basePathProp ?? `/${slug}`;
  const isMultiPage = layoutMode === 'multi-page';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isMultiPage) {
      const onScroll = () => {
        const sections = navItems.map((item) => document.getElementById(item.id));
        const current = sections.findIndex((el) => {
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.top <= 120 && rect.bottom > 120;
        });
        if (current >= 0) setActive(navItems[current].id);
      };
      onScroll();
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }
    const segment = location.pathname.replace(basePath, '').replace(/^\//, '');
    setActive(segment || 'home');
  }, [isMultiPage, location.pathname, basePath, navItems]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navLinkClass = (isActive: boolean) =>
    cn(
      'font-mono text-xs transition-all px-3 py-1.5 rounded-full',
      isActive
        ? 'text-accent glass-pill-active'
        : 'text-subtle hover:text-primary hover:glass-pill'
    );

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? 'glass-nav shadow-glass' : 'bg-transparent'
      )}
    >
      <Container className="flex h-16 items-center justify-between">
        {isMultiPage ? (
          <Link to={basePath} className="font-mono text-sm font-medium text-accent hover:text-accent-hover flex items-center gap-1.5">
            <Home className="h-3.5 w-3.5" />
            {name.split(' ')[0].toLowerCase()}.
          </Link>
        ) : (
          <button
            onClick={() => scrollTo('hero')}
            className="font-mono text-sm font-medium text-accent hover:text-accent-hover"
          >
            {name.split(' ')[0].toLowerCase()}.
          </button>
        )}

        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) =>
            isMultiPage ? (
              <Link
                key={item.id}
                to={`${basePath}/${item.path}`}
                className={navLinkClass(active === item.path)}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={navLinkClass(active === item.id)}
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="glass-icon-btn"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            className="md:hidden glass-icon-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {mobileOpen && (
        <div className="md:hidden glass-nav-mobile border-t border-white/10">
          <Container className="py-4 flex flex-col gap-2">
            {navItems.map((item) =>
              isMultiPage ? (
                <Link
                  key={item.id}
                  to={`${basePath}/${item.path}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-left font-mono text-sm text-secondary hover:text-accent py-2 px-3 rounded-lg hover:glass-pill"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-left font-mono text-sm text-secondary hover:text-accent py-2 px-3 rounded-lg hover:glass-pill"
                >
                  {item.label}
                </button>
              )
            )}
          </Container>
        </div>
      )}
    </header>
  );
}
