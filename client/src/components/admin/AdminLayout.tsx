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
  ChevronDown,
  ChevronLeft,
  PanelLeft,
  Plus,
  Palette,
  ListChecks,
  Tag,
  ShoppingCart,
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
import { PageLoader } from '@/components/ui/PageLoader';
import { Tooltip } from '@/components/ui/Tooltip';
import { AccountMenu } from '@/components/admin/AccountMenu';
import { UnreadMessagesProvider, useUnreadMessages } from '@/context/UnreadMessagesContext';
import { cartCount, subscribeCart } from '@/lib/planCheckout';

const COLLAPSE_KEY = 'portfolio-sidebar-collapsed';

function userInitials(name?: string | null, email?: string | null) {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  /** Show a notification indicator (e.g. unread messages) */
  showDot?: boolean;
  /** Numeric badge (e.g. cart count) */
  badge?: number;
};

const GLOBAL_NAV: NavItem[] = [
  { to: '/dashboard/portfolios', label: 'Portfolios', icon: Users },
  { to: '/dashboard/pricing', label: 'Pricing', icon: Tag },
  { to: '/dashboard/cart', label: 'Saved plans', icon: ShoppingCart },
];

const PORTFOLIO_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/content', label: 'Profile & Hero', icon: User },
  { to: '/dashboard/skills', label: 'Skills', icon: Wrench },
  { to: '/dashboard/experience', label: 'Experience', icon: Briefcase },
  { to: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { to: '/dashboard/education', label: 'Education', icon: GraduationCap },
  { to: '/dashboard/themes/new', label: 'Themes', icon: Palette },
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
  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center rounded-lg text-sm transition-colors duration-200',
          collapsed ? 'h-9 w-9 justify-center' : 'gap-3 px-3 py-2',
          isActive
            ? 'bg-[#0066FF]/12 text-[#0066FF]'
            : 'text-secondary hover:bg-muted/80 hover:text-primary'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && (
            <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[#0066FF]" />
          )}
          <span className="relative shrink-0">
            <item.icon className="h-4 w-4" />
            {item.showDot && collapsed ? (
              <span
                className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[rgb(var(--bg-elevated))]"
                aria-label="Unread"
              />
            ) : null}
          </span>
          {!collapsed && (
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="ml-auto inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0066FF] px-1 text-[10px] font-semibold text-white">
                  {item.badge}
                </span>
              ) : item.showDot ? (
                <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
              ) : null}
            </span>
          )}
          {collapsed && item.badge && item.badge > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#0066FF] px-0.5 text-[8px] font-bold text-white">
              {item.badge > 9 ? '9+' : item.badge}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip content={item.showDot ? `${item.label} · Unread` : item.label} side="right">
      <span className="mx-auto flex w-full justify-center">{link}</span>
    </Tooltip>
  );
}

function NavSection({
  title,
  items,
  collapsed,
  onNavigate,
  showDivider = true,
}: {
  title: string;
  items: NavItem[];
  collapsed: boolean;
  onNavigate: (e: React.MouseEvent) => void;
  showDivider?: boolean;
}) {
  return (
    <div className={cn('flex flex-col', collapsed ? 'items-stretch gap-1' : 'gap-0.5')}>
      {collapsed ? (
        showDivider ? (
          <div className="mx-auto my-1.5 h-px w-6 bg-[#0066FF]/15 dark:bg-white/10" aria-hidden />
        ) : (
          <div className="h-0.5" aria-hidden />
        )
      ) : (
        <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0066FF]/75">
          {title}
        </p>
      )}
      {items.map((item) => (
        <NavItemLink key={item.to} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

function SidebarNav({
  collapsed,
  onboarding,
  onNavClick,
}: {
  collapsed: boolean;
  onboarding: boolean;
  onNavClick: (e: React.MouseEvent) => void;
}) {
  const { unreadCount } = useUnreadMessages();
  const [cartItems, setCartItems] = useState(() => cartCount());
  useEffect(() => subscribeCart(() => setCartItems(cartCount())), []);

  const portfolioNav = PORTFOLIO_NAV.map((item) =>
    item.to === '/dashboard/messages' ? { ...item, showDot: unreadCount > 0 } : item
  );
  const globalNav = GLOBAL_NAV.map((item) =>
    item.to === '/dashboard/cart' ? { ...item, badge: cartItems } : item
  );

  return (
    <nav className="admin-sidebar-nav min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-2 py-3">
      {onboarding && (
        <NavItemLink
          item={{
            to: '/dashboard/onboarding',
            label: 'Setup checklist',
            icon: ListChecks,
          }}
          collapsed={collapsed}
          onNavigate={onNavClick}
        />
      )}
      <NavSection
        title="Global"
        items={globalNav}
        collapsed={collapsed}
        onNavigate={onNavClick}
        showDivider={Boolean(onboarding)}
      />
      <NavSection
        title="This portfolio"
        items={portfolioNav}
        collapsed={collapsed}
        onNavigate={onNavClick}
      />
    </nav>
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
      toast.success('Preview link copied');
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
          <Tooltip content="Collapse sidebar">
            <button
              type="button"
              className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-subtle hover:bg-muted hover:text-primary transition-colors"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </Tooltip>
        )}
      </div>

      <SidebarNav collapsed={opts.collapsed} onboarding={onboarding} onNavClick={onNavClick} />
    </>
  );

  return (
    <UnreadMessagesProvider>
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
          'dashboard-sidebar relative hidden h-svh min-h-0 shrink-0 flex-col md:flex',
          'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          collapsed ? 'w-[4.25rem]' : 'w-60'
        )}
      >
        {sidebarInner({ collapsed })}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="dashboard-header relative z-[70] flex h-14 shrink-0 items-center gap-3 px-3 sm:px-5">
          {/* Left: nav + portfolio context */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#0066FF]/12 text-secondary transition-colors hover:bg-muted hover:text-primary md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {collapsed && (
              <Tooltip content="Expand sidebar">
                <button
                  type="button"
                  className="hidden h-8 w-8 items-center justify-center rounded-lg border border-[#0066FF]/12 text-subtle transition-colors hover:bg-muted hover:text-primary md:inline-flex"
                  onClick={() => setCollapsed(false)}
                  aria-label="Expand sidebar"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
              </Tooltip>
            )}

            <div className="relative min-w-0">
              <button
                ref={switcherBtnRef}
                type="button"
                onClick={() => setSwitcherOpen((open) => !open)}
                aria-expanded={switcherOpen}
                aria-haspopup="listbox"
                aria-label="Switch portfolio"
                className={cn(
                  'flex h-8 max-w-full items-center gap-2 rounded-lg border px-2.5 text-sm transition-colors',
                  'border-[#0066FF]/15 bg-elevated/80 hover:border-[#0066FF]/30 hover:bg-muted dark:border-border',
                  switcherOpen && 'border-[#0066FF]/35 ring-2 ring-[#0066FF]/15'
                )}
              >
                {activeProfile ? (
                  <>
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-[#0066FF]/12 text-[9px] font-bold text-[#0066FF]">
                      {userInitials(activeProfile.displayName)}
                    </span>
                    <span className="min-w-0 max-w-[10rem] truncate font-medium text-primary sm:max-w-[14rem] md:max-w-[18rem]">
                      {activeProfile.displayName}
                    </span>
                    {activeProfile.isPublished ? (
                      <Badge
                        variant="accent"
                        className="hidden font-sans text-[9px] uppercase tracking-[0.08em] sm:inline-flex"
                      >
                        Live
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="hidden font-sans text-[9px] uppercase tracking-[0.08em] sm:inline-flex"
                      >
                        Draft
                      </Badge>
                    )}
                    <ChevronDown
                      className={cn(
                        'ml-0.5 h-3.5 w-3.5 shrink-0 text-subtle transition-transform duration-200',
                        switcherOpen && 'rotate-180'
                      )}
                    />
                  </>
                ) : (
                  <span className="text-subtle">Select portfolio</span>
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
                        placeholder="Search portfolios…"
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
                            <p className="truncate text-[11px] text-subtle">/{p.slug}</p>
                          </div>
                          {p.isPublished ? (
                            <Badge variant="accent" className="font-sans text-[9px] uppercase tracking-wide">
                              Live
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="font-sans text-[9px] uppercase tracking-wide">
                              Draft
                            </Badge>
                          )}
                        </button>
                      ))}
                      {!filteredProfiles.length && (
                        <p className="px-3 py-2 text-xs text-subtle">No portfolios match.</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSwitcherOpen(false);
                          navigate('/dashboard/portfolios');
                        }}
                        className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#0066FF] transition-colors hover:bg-muted"
                      >
                        <Plus className="h-4 w-4" /> Create new portfolio
                      </button>
                    </div>
                  </>,
                  document.body
                )}
            </div>

            {activeProfile ? (
              <Tooltip content={`Public path /${activeProfile.slug}`}>
                <span className="hidden min-w-0 items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-[11px] text-subtle lg:inline-flex">
                  <span className="text-[#0066FF]/50">/</span>
                  <span className="max-w-[10rem] truncate">{activeProfile.slug}</span>
                </span>
              </Tooltip>
            ) : null}
          </div>

          {/* Right: actions + account */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {activeProfile ? (
              <>
                <Tooltip content="Copy public link">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 border-[#0066FF]/15 p-0"
                    onClick={copyLink}
                    aria-label="Copy public link"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </Tooltip>
                <Tooltip content={activeProfile.isPublished ? 'Open live site' : 'Open draft preview'}>
                  <Button size="sm" className="h-8 gap-1.5 px-2.5 sm:px-3" asChild>
                    <a
                      href={getPortfolioViewUrl(activeProfile)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={
                        activeProfile.isPublished ? 'View live portfolio' : 'Preview draft portfolio'
                      }
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">
                        {activeProfile.isPublished ? 'View live' : 'Preview'}
                      </span>
                    </a>
                  </Button>
                </Tooltip>
                <span className="mx-0.5 hidden h-5 w-px bg-[#0066FF]/15 sm:block dark:bg-white/10" aria-hidden />
              </>
            ) : null}

            <AccountMenu
              name={user?.name}
              email={user?.email}
              accountPath="/dashboard/account"
              onSignOut={() => void handleLogout()}
            />
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
    </UnreadMessagesProvider>
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

  if (loading) return <PageLoader variant="inline" label="Loading portfolio" />;
  if (!activeProfile) return null;
  return <>{children}</>;
}
