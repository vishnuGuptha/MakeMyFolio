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

type NavItem = { to: string; label: string; hash?: boolean; emphasize?: boolean };

const NAV: NavItem[] = [
  { to: '/try', label: 'Try', emphasize: true },
  { to: '/#themes', label: 'Themes', hash: true },
  { to: '/examples', label: 'Examples' },
  { to: '/#pricing', label: 'Pricing', hash: true },
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
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'rounded-lg px-3 py-2 text-sm transition-colors',
          item.emphasize
            ? isActive
              ? 'bg-accent/15 font-medium text-accent'
              : 'font-medium text-accent hover:bg-accent/10'
            : isActive
              ? 'text-accent'
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

  return (
    <div
      className={cn(
        'bg-base text-primary marketing-mesh',
        isTryWorkspace ? 'flex h-svh flex-col overflow-hidden' : 'min-h-svh'
      )}
    >
      <header className="sticky top-0 z-50 shrink-0 border-b border-border/60 bg-base/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
            <BrandLogo size={26} />
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavItemLink key={item.label} item={item} />
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <AppThemeToggle />
            {user?.role === 'user' ? (
              <Button size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/try">Try free</Link>
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 md:hidden">
            <AppThemeToggle />
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-muted"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-border px-4 py-3 space-y-1 md:hidden">
            {NAV.map((item) => (
              <NavItemLink
                key={item.label}
                item={item}
                onNavigate={() => setOpen(false)}
                className="block"
              />
            ))}
            <div className="flex gap-2 pt-2">
              {user?.role === 'user' ? (
                <Button size="sm" className="flex-1" asChild>
                  <Link to="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
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
                <Link to="/try" className="block text-subtle hover:text-accent">
                  Try editor
                </Link>
                <a href="/#themes" className="block text-subtle hover:text-accent">
                  Themes
                </a>
                <Link to="/examples" className="block text-subtle hover:text-accent">
                  Examples
                </Link>
                <a href="/#pricing" className="block text-subtle hover:text-accent">
                  Pricing
                </a>
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
