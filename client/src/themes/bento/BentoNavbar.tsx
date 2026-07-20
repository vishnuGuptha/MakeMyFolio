import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVisibleNavSections } from '@/lib/theme';
import { usePortfolioData } from '@/context/PortfolioContext';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { PortfolioNavAvatar } from '@/themes/shared/PortfolioNavAvatar';
import type { NavbarProps } from '../types';

/** Reference-style nav shows a short set on single-page; full list still available in mobile. */
const BOARD_NAV_IDS = new Set(['about', 'projects', 'contact']);

export default function BentoNavbar({
  name,
  slug,
  basePath: basePathProp,
  layoutMode,
  sectionVisibility,
  profileImageUrl,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('');
  const location = useLocation();
  const { content } = usePortfolioData();
  const allNav = useMemo(() => getVisibleNavSections(sectionVisibility), [sectionVisibility]);
  const displayNav = useMemo(() => {
    if (layoutMode === 'multi-page') return allNav;
    const compact = allNav.filter((n) => BOARD_NAV_IDS.has(n.id));
    return compact.length ? compact : allNav.slice(0, 3);
  }, [allNav, layoutMode]);
  const basePath = basePathProp ?? `/${slug}`;
  const isMultiPage = layoutMode === 'multi-page';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!isMultiPage) {
      const onScroll = () => {
        const sections = displayNav.map((item) => document.getElementById(item.id));
        const current = sections.findIndex((el) => {
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.top <= 120 && rect.bottom > 120;
        });
        if (current >= 0) setActive(displayNav[current].id);
      };
      onScroll();
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }
    const segment = location.pathname.replace(basePath, '').replace(/^\//, '');
    setActive(segment || 'home');
  }, [isMultiPage, location.pathname, basePath, displayNav]);

  const scrollTo = (id: string) => {
    const target = id === 'home' ? 'hero' : id;
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled ? 'bento-nav-scrolled' : 'bento-nav'
      )}
    >
      <div className="bento-container flex h-16 md:h-[4.25rem] items-center justify-between gap-4">
        {isMultiPage ? (
          <Link to={basePath} className="bento-brand truncate inline-flex items-center gap-2.5 min-w-0">
            <PortfolioNavAvatar name={name} imageUrl={profileImageUrl} size={32} />
            <span className="truncate">{name}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => scrollTo('home')}
            className="bento-brand truncate text-left inline-flex items-center gap-2.5 min-w-0"
          >
            <PortfolioNavAvatar name={name} imageUrl={profileImageUrl} size={32} />
            <span className="truncate">{name}</span>
          </button>
        )}

        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {displayNav.map((item) =>
              isMultiPage ? (
                <Link
                  key={item.id}
                  to={`${basePath}/${item.path}`}
                  className={cn('bento-nav-link', active === item.path && 'bento-nav-link-active')}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollTo(item.id)}
                  className={cn('bento-nav-link', active === item.id && 'bento-nav-link-active')}
                >
                  {item.label}
                </button>
              )
            )}
          </nav>

          {content && (
            <SocialIconLinks
              content={content}
              size="sm"
              exclude={['portfolio', 'email']}
              className="hidden sm:flex shrink-0"
              linkClassName="text-[var(--bento-ink-muted)] hover:text-[var(--bento-ink)] bg-black/5"
            />
          )}

          <button
            type="button"
            className="md:hidden p-2 text-[var(--bento-ink)]"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-black/5 bg-[var(--bento-bg)] px-4 py-3 space-y-1">
          {allNav.map((item) =>
            isMultiPage ? (
              <Link
                key={item.id}
                to={`${basePath}/${item.path}`}
                className="block py-2.5 bento-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className="block w-full text-left py-2.5 bento-nav-link"
              >
                {item.label}
              </button>
            )
          )}
          {content && (
            <SocialIconLinks
              content={content}
              size="sm"
              className="pt-3"
              linkClassName="text-[var(--bento-ink-muted)] hover:text-[var(--bento-ink)] bg-black/5"
            />
          )}
        </div>
      )}
    </header>
  );
}
