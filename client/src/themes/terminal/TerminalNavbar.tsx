import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { publicApi } from '@/api';
import { TerminalContainer } from './layout/TerminalSection';
import { getVisibleNavSections } from '@/lib/theme';
import type { NavbarProps } from '../types';

export default function TerminalNavbar({
  name,
  slug,
  basePath: basePathProp,
  layoutMode,
  sectionVisibility,
  resumeUrl,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('');
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navItems = getVisibleNavSections(sectionVisibility);
  const basePath = basePathProp ?? `/${slug}`;
  const isMultiPage = layoutMode === 'multi-page';
  const firstName = name.split(' ')[0];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isMultiPage) {
      const onScroll = () => {
        const sections = [{ id: 'hero' }, ...navItems].map((item) => document.getElementById(item.id));
        const current = sections.findIndex((el) => {
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.top <= 120 && rect.bottom > 120;
        });
        const ids = ['home', ...navItems.map((n) => n.id)];
        if (current >= 0) setActive(ids[current]);
      };
      onScroll();
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }
    const segment = location.pathname.replace(basePath, '').replace(/^\//, '');
    setActive(segment || 'home');
  }, [isMultiPage, location.pathname, basePath, navItems]);

  const scrollTo = (id: string) => {
    const target = id === 'home' ? 'hero' : id;
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navLinkClass = (isActive: boolean) =>
    cn(
      'font-mono text-xs xl:text-sm px-2.5 py-1.5 shrink-0 transition-colors whitespace-nowrap',
      isActive ? 'terminal-nav-link-active text-accent' : 'text-subtle hover:text-primary'
    );

  const homeLink = isMultiPage ? (
    <Link to={basePath} className={navLinkClass(active === 'home')}>Home</Link>
  ) : (
    <button onClick={() => scrollTo('home')} className={navLinkClass(active === 'home')}>Home</button>
  );

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 font-mono transition-all duration-300',
        scrolled ? 'terminal-nav-scrolled' : 'bg-transparent'
      )}
    >
      <TerminalContainer className="flex h-14 md:h-16 items-center gap-3 min-w-0">
        <div className="shrink-0 min-w-0 text-xs sm:text-sm truncate">
          <span className="text-accent font-semibold">{firstName}</span>
          <span className="text-subtle hidden sm:inline"> · Portfolio</span>
        </div>

        <nav className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-0.5 overflow-x-auto terminal-nav-scroll px-1">
          {homeLink}
          {navItems.map((item) =>
            isMultiPage ? (
              <Link
                key={item.id}
                to={`${basePath}/${item.path}`}
                className={navLinkClass(active === item.path || active === item.id)}
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

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {resumeUrl && (
            <a
              href={publicApi.getResumeUrl(slug, true)}
              download
              className="terminal-nav-btn hidden md:inline-flex"
            >
              Resume
            </a>
          )}
          <button
            onClick={() => scrollTo('contact')}
            className="terminal-nav-btn terminal-nav-btn-primary hidden md:inline-flex"
          >
            Hire Me
          </button>
          <button
            onClick={toggleTheme}
            className="terminal-nav-btn terminal-nav-icon-btn"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            className="terminal-nav-btn xl:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </TerminalContainer>

      {mobileOpen && (
        <div className="xl:hidden border-t border-border bg-elevated/95 backdrop-blur-xl font-mono">
          <TerminalContainer className="py-4 flex flex-col gap-1">
            {isMultiPage ? (
              <Link to={basePath} onClick={() => setMobileOpen(false)} className="text-sm py-2 px-2 text-primary hover:text-accent">
                Home
              </Link>
            ) : (
              <button onClick={() => scrollTo('home')} className="text-left text-sm py-2 px-2 text-primary hover:text-accent">
                Home
              </button>
            )}
            {navItems.map((item) =>
              isMultiPage ? (
                <Link
                  key={item.id}
                  to={`${basePath}/${item.path}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm py-2 px-2 text-primary hover:text-accent"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-left text-sm py-2 px-2 text-primary hover:text-accent"
                >
                  {item.label}
                </button>
              )
            )}
            {resumeUrl && (
              <a href={publicApi.getResumeUrl(slug, true)} download className="text-sm py-2 px-2 text-accent">
                Resume
              </a>
            )}
            <button onClick={() => scrollTo('contact')} className="text-sm py-2 px-2 text-accent font-semibold">
              Hire Me
            </button>
          </TerminalContainer>
        </div>
      )}
    </header>
  );
}
