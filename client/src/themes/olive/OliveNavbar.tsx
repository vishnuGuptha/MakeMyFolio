import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { usePortfolioData } from '@/context/PortfolioContext';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { getVisibleNavSections } from '@/lib/theme';
import { cn } from '@/lib/utils';
import type { NavbarProps } from '../types';

const LABEL: Record<string, string> = {
  home: 'Home',
  about: 'About',
  skills: 'Skills',
  experience: 'Experience',
  projects: 'Projects',
  education: 'Education',
  certifications: 'Certifications',
  contact: 'Contact',
};

const TOP_THRESHOLD = 24;
const HIDE_DELTA = 8;

export default function OliveNavbar({ slug, basePath: basePathProp, layoutMode, sectionVisibility }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState('home');
  const [navHidden, setNavHidden] = useState(false);
  const lastY = useRef(0);
  const { content } = usePortfolioData();
  const location = useLocation();
  const navItems = getVisibleNavSections(sectionVisibility);

  const ordered = useMemo(() => {
    const preferred = ['about', 'skills', 'experience', 'projects', 'contact'];
    const preferredItems = preferred
      .map((id) => navItems.find((n) => n.id === id))
      .filter(Boolean) as typeof navItems;
    const rest = navItems.filter((n) => !preferred.includes(n.id));
    return [...preferredItems, ...rest];
  }, [navItems]);

  const basePath = basePathProp ?? `/${slug}`;
  const isMultiPage = layoutMode === 'multi-page';
  const orderedIds = ordered.map((n) => n.id).join(',');

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const prev = lastY.current;
      const delta = y - prev;

      if (mobileOpen) {
        setNavHidden(false);
      } else if (y <= TOP_THRESHOLD) {
        setNavHidden(false);
      } else if (delta > HIDE_DELTA) {
        setNavHidden(true);
      } else if (delta < -HIDE_DELTA) {
        setNavHidden(false);
      }

      lastY.current = y;

      if (isMultiPage) return;

      const ids = ['hero', ...ordered.map((n) => n.id)];
      const labels = ['home', ...ordered.map((n) => n.id)];
      const idx = ids.findIndex((id) => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 140 && rect.bottom > 140;
      });
      if (idx >= 0) setActive(labels[idx]);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMultiPage, orderedIds, ordered, mobileOpen]);

  useEffect(() => {
    if (isMultiPage) {
      const segment = location.pathname.replace(basePath, '').replace(/^\//, '');
      setActive(segment || 'home');
    }
  }, [isMultiPage, location.pathname, basePath]);

  useEffect(() => {
    if (mobileOpen) setNavHidden(false);
  }, [mobileOpen]);

  const scrollTo = (id: string) => {
    document.getElementById(id === 'home' ? 'hero' : id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const renderLink = (id: string, label: string) => {
    const className = cn('olive-nav-link', active === id && 'olive-nav-link-active');
    if (isMultiPage) {
      const path = id === 'home' ? basePath : `${basePath}/${id}`;
      return (
        <Link key={id} to={path} className={className} onClick={() => setMobileOpen(false)}>
          {label}
        </Link>
      );
    }
    return (
      <button key={id} type="button" className={className} onClick={() => scrollTo(id)}>
        {label}
      </button>
    );
  };

  return (
    <div
      className={cn('olive-nav', navHidden && !mobileOpen && 'olive-nav-hidden')}
      aria-hidden={navHidden && !mobileOpen}
    >
      <div className="olive-nav-bar">
        <div className="olive-nav-links">
          {renderLink('home', 'Home')}
          {ordered.map((item) => renderLink(item.id, LABEL[item.id] || item.label))}
        </div>
        <div className="olive-nav-actions">
          {content && (
            <SocialIconLinks
              content={content}
              size="sm"
              exclude={['portfolio']}
              linkClassName="olive-icon-btn !h-8 !w-8"
            />
          )}
          <button
            type="button"
            className="olive-icon-btn olive-nav-mobile"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="olive-nav-drawer">
          {renderLink('home', 'Home')}
          {ordered.map((item) => renderLink(item.id, LABEL[item.id] || item.label))}
        </div>
      )}
    </div>
  );
}
