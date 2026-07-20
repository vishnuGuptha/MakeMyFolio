import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from '@/brand/logo';
import { BRAND } from '@/brand/constants';
import { Button } from '@/components/ui/Button';
import { AppThemeToggle } from '@/components/ui/AppThemeToggle';
import { cn } from '@/lib/utils';
import { resetDocumentThemeForAdmin } from '@/lib/theme';
import { useAuth } from '@/context/AuthContext';
import { GuestDraftProvider } from '@/context/GuestDraftContext';
import AuthGateModal from '@/components/auth/AuthGateModal';
import { useGuestDraft } from '@/context/GuestDraftContext';

type NavItem = { to: string; label: string; hash?: boolean };

const NAV: NavItem[] = [
  { to: '/', label: 'Home' },
  { to: '/try', label: 'Try' },
  { to: '/themes', label: 'Themes' },
  { to: '/pricing', label: 'Pricing' },
];

function NavItemLink({
  item,
  onNavigate,
  className,
}: {
  item: NavItem;
  onNavigate?: () => void;
  className?: string;
}) {
  if (item.hash) {
    return (
      <a
        href={item.to}
        onClick={onNavigate}
        className={cn(
          'rounded-lg px-3 py-2 text-sm text-secondary transition-colors hover:bg-muted hover:text-primary',
          className
        )}
      >
        {item.label}
      </a>
    );
  }

  return (
    <NavLink
      to={item.to}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'rounded-lg px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-accent/10 font-medium text-accent'
            : 'text-secondary hover:bg-muted hover:text-primary',
          className
        )
      }
    >
      {item.label}
    </NavLink>
  );
}

function MarketingChrome() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { authGate, closeAuthGate } = useGuestDraft();
  const { pathname } = useLocation();
  const isTryWorkspace = pathname === '/try';

  useEffect(() => {
    resetDocumentThemeForAdmin();
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isHome = pathname === '/';

  return (
    <div
      className={cn(
        'marketing-shell bg-base text-primary',
        !isHome && 'marketing-mesh',
        isTryWorkspace ? 'flex h-svh flex-col overflow-hidden' : 'min-h-svh'
      )}
    >
      <header className="sticky top-0 z-50 shrink-0 px-3 pt-3 sm:px-4">
        <div
          className={cn(
            'mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 rounded-full border border-border/70 bg-elevated/75 px-3 shadow-[0_8px_32px_-12px_rgb(15_23_42/0.18)] backdrop-blur-xl sm:h-14 sm:px-4',
            'dark:border-white/10 dark:bg-elevated/70 dark:shadow-[0_8px_32px_-12px_rgb(0_0_0/0.55)]'
          )}
        >
          <Link to="/" className="shrink-0 pl-1" onClick={() => setOpen(false)}>
            <BrandLogo size={24} />
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavItemLink key={item.label} item={item} className="rounded-full px-3.5 py-1.5" />
            ))}
          </nav>
          <div className="hidden items-center gap-1.5 md:flex">
            <AppThemeToggle />
            {user?.role === 'user' ? (
              <Button size="sm" asChild className="rounded-full">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" asChild className="rounded-full">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" variant="outline" asChild className="rounded-full">
                  <Link to="/try">Try free</Link>
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 md:hidden">
            <AppThemeToggle />
            <button
              type="button"
              className="rounded-full p-2 hover:bg-muted"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="mx-auto mt-2 max-w-5xl space-y-1 rounded-2xl border border-border/70 bg-elevated/95 px-3 py-3 shadow-lg backdrop-blur-xl md:hidden">
            {NAV.map((item) => (
              <NavItemLink
                key={item.label}
                item={item}
                onNavigate={() => setOpen(false)}
                className="block rounded-xl"
              />
            ))}
            <div className="flex gap-2 pt-2">
              {user?.role === 'user' ? (
                <Button size="sm" className="flex-1 rounded-full" asChild>
                  <Link to="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="ghost" className="flex-1 rounded-full" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 rounded-full" asChild>
                    <Link to="/try" onClick={() => setOpen(false)}>
                      Try free
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <div className={cn(isTryWorkspace && 'min-h-0 flex-1 overflow-hidden')}>
        <Outlet />
      </div>

      {!isTryWorkspace && (
        <footer className="mt-auto border-t border-border/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:justify-between">
            <div>
              <BrandLogo size={24} />
              <p className="mt-2 max-w-xs text-sm text-subtle">{BRAND.tagline}</p>
            </div>
            <div className="flex flex-wrap gap-10 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-primary">Product</p>
                <Link to="/" className="block text-subtle hover:text-accent">
                  Home
                </Link>
                <Link to="/try" className="block text-subtle hover:text-accent">
                  Try editor
                </Link>
                <Link to="/themes" className="block text-subtle hover:text-accent">
                  Themes
                </Link>
                <Link to="/pricing" className="block text-subtle hover:text-accent">
                  Pricing
                </Link>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-primary">Account</p>
                <Link to="/login" className="block text-subtle hover:text-accent">
                  Log in
                </Link>
                <Link to="/register" className="block text-subtle hover:text-accent">
                  Sign up
                </Link>
              </div>
              <div className="space-y-2">
                <p className="font-medium text-primary">Legal</p>
                <Link to="/privacy" className="block text-subtle hover:text-accent">
                  Privacy
                </Link>
                <Link to="/terms" className="block text-subtle hover:text-accent">
                  Terms
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 py-4 text-center text-xs text-subtle">
            © {new Date().getFullYear()} {BRAND.name} · {BRAND.domain}
          </div>
        </footer>
      )}

      {authGate && <AuthGateModal reason={authGate} onClose={closeAuthGate} />}
    </div>
  );
}

export default function MarketingLayout() {
  return (
    <GuestDraftProvider>
      <MarketingChrome />
    </GuestDraftProvider>
  );
}
