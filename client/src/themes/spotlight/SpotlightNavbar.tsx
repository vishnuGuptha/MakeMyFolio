import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Download, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { publicApi } from '@/api';
import { SpotlightContainer } from './layout/SpotlightSection';
import { getVisibleNavSections } from '@/lib/theme';
import type { NavbarProps } from '../types';

export default function SpotlightNavbar({
  name,
  slug,
  basePath: basePathProp,
  layoutMode,
  sectionVisibility,
  profileImageUrl,
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
      'theme-nav-link text-xs xl:text-sm font-medium transition-colors px-2 xl:px-3 py-2 shrink-0',
      isActive ? 'theme-nav-link-active' : 'text-subtle hover:text-primary'
    );

  const homeLink = isMultiPage ? (
    <Link to={basePath} className={navLinkClass(active === 'home')}>
      Home
    </Link>
  ) : (
    <button onClick={() => scrollTo('home')} className={navLinkClass(active === 'home')}>
      Home
    </button>
  );

  const actionBtnClass =
    'inline-flex items-center justify-center h-9 shrink-0 whitespace-nowrap rounded-full text-xs font-medium transition-colors';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? 'spotlight-nav-scrolled' : 'bg-transparent'
      )}
    >
      <SpotlightContainer className="flex h-16 items-center gap-3 min-w-0">
        <div className="shrink-0 min-w-0">
        {isMultiPage ? (
          <Link to={basePath} className="flex items-center gap-2 shrink-0">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-accent/50" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <User className="h-4 w-4 text-accent" />
              </div>
            )}
            <span className="font-semibold text-sm">
              {firstName}<span className="text-accent">.dev</span>
            </span>
          </Link>
        ) : (
          <button onClick={() => scrollTo('home')} className="flex items-center gap-2 shrink-0">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-accent/50" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                <User className="h-4 w-4 text-accent" />
              </div>
            )}
            <span className="font-semibold text-sm">
              {firstName}<span className="text-accent">.dev</span>
            </span>
          </button>
        )}

        </div>

        <nav className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-0.5 overflow-x-auto spotlight-nav-scroll px-1">
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
              className={cn(actionBtnClass, 'hidden md:inline-flex gap-1.5 px-3 spotlight-cta-outline')}
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              Resume
            </a>
          )}
          <button
            onClick={() => scrollTo('contact')}
            className={cn(actionBtnClass, 'hidden md:inline-flex px-4 font-semibold spotlight-cta-primary')}
          >
            Hire Me
          </button>
          <button
            onClick={toggleTheme}
            className="spotlight-icon-btn h-9 w-9 inline-flex items-center justify-center shrink-0"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            className="xl:hidden spotlight-icon-btn h-9 w-9 inline-flex items-center justify-center shrink-0"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </SpotlightContainer>

      {mobileOpen && (
        <div className="xl:hidden border-t border-border bg-elevated/95 backdrop-blur-xl">
          <SpotlightContainer className="py-4 flex flex-col gap-2">
            {isMultiPage ? (
              <Link to={basePath} onClick={() => setMobileOpen(false)} className="text-left text-sm py-2 px-3 rounded-lg hover:bg-muted/50 text-primary">
                Home
              </Link>
            ) : (
              <button onClick={() => scrollTo('home')} className="text-left text-sm py-2 px-3 rounded-lg hover:bg-muted/50 text-primary">
                Home
              </button>
            )}
            {navItems.map((item) =>
              isMultiPage ? (
                <Link
                  key={item.id}
                  to={`${basePath}/${item.path}`}
                  onClick={() => setMobileOpen(false)}
                  className="text-left text-sm py-2 px-3 rounded-lg hover:bg-muted/50 text-primary"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className="text-left text-sm py-2 px-3 rounded-lg hover:bg-muted/50 text-primary"
                >
                  {item.label}
                </button>
              )
            )}
            {resumeUrl && (
              <a
                href={publicApi.getResumeUrl(slug, true)}
                download
                className="text-left text-sm py-2 px-3 rounded-lg hover:bg-muted/50 flex items-center gap-2 text-primary"
              >
                <Download className="h-4 w-4" /> Resume
              </a>
            )}
            <button
              onClick={() => scrollTo('contact')}
              className="text-left text-sm py-2 px-3 rounded-lg spotlight-cta-primary font-semibold"
            >
              Hire Me
            </button>
          </SpotlightContainer>
        </div>
      )}
    </header>
  );
}
