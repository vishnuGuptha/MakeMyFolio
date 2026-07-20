import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Wrench,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Settings,
  Mail,
  Image,
  Users,
  Menu,
  X,
  ExternalLink,
  Copy,
  LogOut,
  ChevronDown,
  ChevronLeft,
  PanelLeft,
  Plus,
  Palette,
  KeyRound,
  ListChecks,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { useUnsavedChanges } from '@/context/UnsavedChangesContext';
import { resetDocumentThemeForAdmin } from '@/lib/theme';
import { isOnboardingActive } from '@/lib/onboarding';
import { cn, getPortfolioViewUrl, getPublicPortfolioUrl } from '@/lib/utils';
import { BrandLogo, BrandMark } from '@/brand/logo';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AppThemeToggle } from '@/components/ui/AppThemeToggle';

const COLLAPSE_KEY = 'portfolio-sidebar-collapsed';

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
};

const GLOBAL_NAV: NavItem[] = [
  { to: '/dashboard/portfolios', label: 'Portfolios', icon: Users },
  { to: '/dashboard/account', label: 'Account', icon: KeyRound },
];

const PORTFOLIO_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/content', label: 'Profile & Hero', icon: User },
  { to: '/dashboard/skills', label: 'Skills', icon: Wrench },
  { to: '/dashboard/experience', label: 'Experience', icon: Briefcase },
  { to: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { to: '/dashboard/education', label: 'Education', icon: GraduationCap },
  { to: '/dashboard/themes/new', label: 'Add Theme', icon: Palette },
  { to: '/dashboard/settings', label: 'Personalization', icon: Settings },
  { to: '/dashboard/messages', label: 'Messages', icon: Mail },
  { to: '/dashboard/media', label: 'Media Library', icon: Image },
];

function NavItemLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate: (e: React.MouseEvent) => void;
}) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center rounded-lg text-sm transition-all duration-200',
          collapsed ? 'justify-center px-0 py-2.5 mx-auto w-10' : 'gap-3 px-3 py-2',
          isActive
            ? 'bg-[#0066FF]/12 text-[#0066FF] ring-1 ring-inset ring-[#0066FF]/20'
            : 'text-secondary hover:bg-muted/80 hover:text-primary'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && (
            <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[#0066FF]" />
          )}
          <item.icon
            className={cn(
              'h-4 w-4 shrink-0 transition-transform duration-200',
              isActive ? 'scale-105' : 'group-hover:scale-105'
            )}
          />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

function NavSection({
  title,
  items,
  collapsed,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  collapsed: boolean;
  onNavigate: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="space-y-0.5">
      {collapsed ? (
        <div className="mx-auto my-1.5 h-px w-5 bg-border/60" aria-hidden />
      ) : (
        <p className="px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0066FF]/80 transition-opacity duration-200">
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavItemLink key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [profileQuery, setProfileQuery] = useState('');
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const switcherBtnRef = useRef<HTMLButtonElement>(null);
  const { user, logout } = useAuth();
  const { profiles, activeProfile, setActiveProfileId } = useAdminProfile();
  const { confirmDiscard } = useUnsavedChanges();
  const navigate = useNavigate();
  const onboarding = isOnboardingActive();

  useEffect(() => {
    resetDocumentThemeForAdmin();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const syncMenuPos = () => {
    const btn = switcherBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 288;
    const left = Math.min(rect.left, window.innerWidth - menuWidth - 8);
    setMenuPos({ top: rect.bottom + 4, left: Math.max(8, left) });
  };

  useLayoutEffect(() => {
    if (!switcherOpen) return;
    syncMenuPos();
    const onReposition = () => syncMenuPos();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [switcherOpen]);

  useEffect(() => {
    if (!switcherOpen) {
      setProfileQuery('');
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSwitcherOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [switcherOpen]);

  const filteredProfiles = profiles.filter((p) => {
    const q = profileQuery.trim().toLowerCase();
    if (!q) return true;
    return `${p.displayName} ${p.slug}`.toLowerCase().includes(q);
  });

  const copyLink = () => {
    if (!activeProfile) return;
    if (!activeProfile.isPublished) {
      navigator.clipboard.writeText(getPortfolioViewUrl(activeProfile));
      toast.success('Preview link copied (login required)');
      return;
    }
    navigator.clipboard.writeText(getPublicPortfolioUrl(activeProfile.slug));
    toast.success('Link copied!');
  };

  const handleLogout = async () => {
    if (!confirmDiscard()) return;
    await logout();
    navigate('/login');
  };

  const guardNav = (e: React.MouseEvent) => {
    if (!confirmDiscard()) e.preventDefault();
  };

  const closeMobile = () => setMobileOpen(false);

  const onNavClick = (e: React.MouseEvent) => {
    guardNav(e);
    if (!e.defaultPrevented) closeMobile();
  };

  const sidebarInner = (opts: { collapsed: boolean; showCloseMobile?: boolean }) => (
    <>
      <div
        className={cn(
          'h-14 shrink-0 border-b border-[#0066FF]/10 flex items-center gap-2 dark:border-white/10',
          opts.collapsed ? 'justify-center px-2' : 'justify-between px-3'
        )}
      >
          <div
            className={cn(
              'flex items-center gap-2 min-w-0',
              opts.collapsed && 'justify-center'
            )}
          >
            {opts.collapsed ? (
              <BrandMark size={28} />
            ) : (
              <BrandLogo size={26} className="text-sm min-w-0" />
            )}
          </div>
        {opts.showCloseMobile && (
          <button
            type="button"
            className="md:hidden p-1.5 rounded-lg hover:bg-muted text-secondary"
            onClick={closeMobile}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {!opts.showCloseMobile && !opts.collapsed && (
          <button
            type="button"
            className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-subtle hover:bg-muted hover:text-primary transition-colors"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <nav className="admin-sidebar-nav flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1">
        {onboarding && (
          <NavItemLink
            item={{
              to: '/dashboard/onboarding',
              label: 'Setup checklist',
              icon: ListChecks,
            }}
            collapsed={opts.collapsed}
            onNavigate={onNavClick}
          />
        )}
        <NavSection title="Global" items={GLOBAL_NAV} collapsed={opts.collapsed} onNavigate={onNavClick} />
        <NavSection
          title="This portfolio"
          items={PORTFOLIO_NAV}
          collapsed={opts.collapsed}
          onNavigate={onNavClick}
        />
      </nav>

      <div
        className={cn(
          'shrink-0 border-t border-[#0066FF]/10 p-2 dark:border-white/10',
          opts.collapsed ? 'flex justify-center' : ''
        )}
      >
        <button
          type="button"
          onClick={handleLogout}
          title="Sign out"
          className={cn(
            'flex items-center rounded-lg text-sm text-secondary transition-colors hover:bg-muted hover:text-primary',
            opts.collapsed ? 'justify-center w-10 h-10' : 'w-full gap-3 px-3 py-2'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!opts.collapsed && <span>Sign out</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="dashboard-shell flex h-svh overflow-hidden bg-base text-primary">
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeMobile}
        aria-hidden={!mobileOpen}
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          'dashboard-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col shadow-2xl md:hidden',
          'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarInner({ collapsed: false, showCloseMobile: true })}
      </aside>

      {/* Desktop sidebar — fixed height, never scrolls with page */}
      <aside
        className={cn(
          'dashboard-sidebar relative hidden h-svh shrink-0 flex-col md:flex',
          'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          collapsed ? 'w-[4.25rem]' : 'w-60'
        )}
      >
        {sidebarInner({ collapsed })}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="dashboard-header relative z-[70] flex h-14 shrink-0 items-center justify-between gap-4 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 transition-colors hover:bg-muted md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {collapsed && (
              <button
                type="button"
                className="hidden h-9 w-9 items-center justify-center rounded-lg border border-[#0066FF]/15 text-subtle transition-colors hover:bg-muted hover:text-primary md:flex"
                onClick={() => setCollapsed(false)}
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            )}

            <div className="relative">
              <button
                ref={switcherBtnRef}
                type="button"
                onClick={() => setSwitcherOpen((open) => !open)}
                aria-expanded={switcherOpen}
                aria-haspopup="listbox"
                className="flex items-center gap-2 rounded-lg border border-[#0066FF]/15 bg-elevated/70 px-3 py-1.5 text-sm backdrop-blur-sm transition-colors hover:border-[#0066FF]/30 hover:bg-muted dark:border-border"
              >
                {activeProfile ? (
                  <>
                    <span className="max-w-[140px] truncate font-medium">{activeProfile.displayName}</span>
                    {activeProfile.isPublished && <Badge variant="accent">Live</Badge>}
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-subtle transition-transform duration-200',
                        switcherOpen && 'rotate-180'
                      )}
                    />
                  </>
                ) : (
                  <span className="text-subtle">Select profile</span>
                )}
              </button>

              {switcherOpen &&
                createPortal(
                  <>
                    <div
                      className="fixed inset-0 z-[80]"
                      aria-hidden
                      onClick={() => setSwitcherOpen(false)}
                    />
                    <div
                      role="listbox"
                      className="fixed z-[90] max-h-[min(20rem,calc(100vh-4.5rem))] w-72 overflow-y-auto rounded-xl border border-[#0066FF]/14 bg-elevated/95 p-2 shadow-[0_20px_48px_-20px_rgb(0_70_180/0.28)] backdrop-blur-md dark:border-white/10"
                      style={{ top: menuPos.top, left: menuPos.left }}
                    >
                      <input
                        autoFocus
                        placeholder="Search profiles..."
                        value={profileQuery}
                        className="mb-2 w-full rounded-lg border border-border bg-base px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066FF]/35"
                        onChange={(e) => setProfileQuery(e.target.value)}
                      />
                      {filteredProfiles.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          role="option"
                          aria-selected={activeProfile?._id === p._id}
                          onClick={() => {
                            if (!setActiveProfileId(p._id)) return;
                            setSwitcherOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                            activeProfile?._id === p._id && 'bg-[#0066FF]/10'
                          )}
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.displayName}</p>
                            <p className="truncate font-mono text-xs text-subtle">/{p.slug}</p>
                          </div>
                          {p.isPublished && <Badge variant="accent">Live</Badge>}
                        </button>
                      ))}
                      {!filteredProfiles.length && (
                        <p className="px-3 py-2 text-xs text-subtle">No profiles match.</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSwitcherOpen(false);
                          navigate('/dashboard/portfolios');
                        }}
                        className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#0066FF] transition-colors hover:bg-muted"
                      >
                        <Plus className="h-4 w-4" /> Create New Profile
                      </button>
                    </div>
                  </>,
                  document.body
                )}
            </div>

            {activeProfile && (
              <p className="hidden truncate font-mono text-xs text-subtle lg:block">
                Editing: {activeProfile.displayName} (/{activeProfile.slug})
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {activeProfile && (
              <>
                <Button size="sm" variant="outline" className="home-cta-secondary border-[#0066FF]/15" onClick={copyLink}>
                  <Copy className="h-3.5 w-3.5" /> Copy Link
                </Button>
                <Button size="sm" variant="outline" className="home-cta-secondary border-[#0066FF]/15" asChild>
                  <a
                    href={getPortfolioViewUrl(activeProfile)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {activeProfile.isPublished ? 'View Live' : 'Preview'}
                  </a>
                </Button>
              </>
            )}
            <span className="hidden max-w-[10rem] truncate text-xs text-subtle sm:block">
              {user?.name || user?.email}
            </span>
            <AppThemeToggle />
            <Button size="sm" variant="ghost" onClick={handleLogout} className="md:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function RequireActiveProfile({ children }: { children: React.ReactNode }) {
  const { activeProfile, loading } = useAdminProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !activeProfile) {
      navigate('/dashboard/portfolios');
    }
  }, [loading, activeProfile, navigate]);

  if (loading) return <div className="text-subtle font-mono text-sm">Loading...</div>;
  if (!activeProfile) return null;
  return <>{children}</>;
}
