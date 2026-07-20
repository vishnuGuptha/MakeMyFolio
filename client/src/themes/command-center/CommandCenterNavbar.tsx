import { useState, useEffect, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { publicApi } from '@/api';
import { getVisibleNavSections } from '@/lib/theme';
import { CommandCenterContainer } from './layout/CommandCenterSection';
import { PortfolioNavAvatar } from '@/themes/shared/PortfolioNavAvatar';
import type { NavbarProps } from '../types';

export default function CommandCenterNavbar({
  name,
  slug,
  basePath: basePathProp,
  layoutMode,
  sectionVisibility,
  resumeUrl,
  profileImageUrl,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('');
  const location = useLocation();
  const navItems = getVisibleNavSections(sectionVisibility);
  const basePath = basePathProp ?? `/${slug}`;
  const isMultiPage = layoutMode === 'multi-page';
  const firstName = name.split(' ')[0].toUpperCase();

  useEffect(() => {
    if (!isMultiPage) {
      const onScroll = () => {
        const sections = [{ id: 'hero' }, ...navItems].map((item) => document.getElementById(item.id));
        const current = sections.findIndex((el) => {
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.top <= 140 && rect.bottom > 140;
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
    cn('cc-nav-link text-xs font-medium shrink-0 whitespace-nowrap', isActive && 'cc-nav-link-active');

  const NavLabel = ({ children, isActive }: { children: ReactNode; isActive: boolean }) => (
    <>
      <span>{children}</span>
      <span className="cc-nav-link-dot" aria-hidden={!isActive} />
    </>
  );

  const homeLink = isMultiPage ? (
    <Link to={basePath} className={navLinkClass(active === 'home')}>
      <NavLabel isActive={active === 'home'}>Home</NavLabel>
    </Link>
  ) : (
    <button onClick={() => scrollTo('home')} className={navLinkClass(active === 'home')}>
      <NavLabel isActive={active === 'home'}>Home</NavLabel>
    </button>
  );

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-4">
      <CommandCenterContainer className="max-w-5xl">
        <div className="cc-nav-pill flex min-h-14 items-center gap-3 px-4 py-1 min-w-0">
          <div className="shrink-0 flex items-center gap-2 font-bold text-sm tracking-wide min-w-0">
            <PortfolioNavAvatar name={name} imageUrl={profileImageUrl} size={28} />
            <span className="truncate">
              <span className="text-primary">{firstName}</span>
              <span className="text-accent ml-1">DEV</span>
            </span>
          </div>

          <nav className="hidden xl:flex flex-1 min-w-0 items-center justify-center gap-1 cc-nav-scroll">
            {homeLink}
            {navItems.map((item) => {
              const isActive = active === item.path || active === item.id;
              return isMultiPage ? (
                <Link
                  key={item.id}
                  to={`${basePath}/${item.path}`}
                  className={navLinkClass(isActive)}
                >
                  <NavLabel isActive={isActive}>{item.label}</NavLabel>
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={navLinkClass(isActive)}
                >
                  <NavLabel isActive={isActive}>{item.label}</NavLabel>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {resumeUrl && (
              <a
                href={publicApi.getResumeUrl(slug, true)}
                download
                className="cc-btn-secondary hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Resume
              </a>
            )}
            <button
              onClick={() => scrollTo('contact')}
              className="cc-btn-primary hidden md:inline-flex px-4 py-1.5 text-xs"
            >
              Contact
            </button>
            <button
              className="cc-btn-secondary xl:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </CommandCenterContainer>

      {mobileOpen && (
        <CommandCenterContainer className="max-w-5xl mt-2">
          <div className="cc-glass-card p-4 flex flex-col gap-1 xl:hidden">
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
              Contact
            </button>
          </div>
        </CommandCenterContainer>
      )}
    </header>
  );
}
