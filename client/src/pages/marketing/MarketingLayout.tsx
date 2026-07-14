import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { BrandLogo } from '@/brand/logo';
import { BRAND } from '@/brand/constants';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { GuestDraftProvider } from '@/context/GuestDraftContext';
import AuthGateModal from '@/components/auth/AuthGateModal';
import { useGuestDraft } from '@/context/GuestDraftContext';

const NAV = [
  { to: '/#how', label: 'Product', hash: true },
  { to: '/#themes', label: 'Themes', hash: true },
  { to: '/examples', label: 'Examples' },
  { to: '/#pricing', label: 'Pricing', hash: true },
];

function MarketingChrome() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { authGate, closeAuthGate } = useGuestDraft();
  const { pathname } = useLocation();
  const isTryWorkspace = pathname === '/try';

  return (
    <div
      className={cn(
        'bg-base text-primary marketing-mesh',
        isTryWorkspace ? 'flex h-svh flex-col overflow-hidden' : 'min-h-svh'
      )}
    >
      <header className="sticky top-0 z-50 shrink-0 border-b border-border/60 bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
            <BrandLogo size={28} />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) =>
              item.hash ? (
                <a
                  key={item.label}
                  href={item.to}
                  className="rounded-lg px-3 py-2 text-sm text-secondary hover:bg-muted hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive ? 'text-accent' : 'text-secondary hover:bg-muted hover:text-primary'
                    )
                  }
                >
                  {item.label}
                </NavLink>
              )
            )}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
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
                  <Link to="/try">Start free</Link>
                </Button>
              </>
            )}
          </div>
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-muted md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-border px-4 py-3 space-y-1 md:hidden">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.to}
                className="block rounded-lg px-3 py-2 text-sm text-secondary hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link to="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link to="/try" onClick={() => setOpen(false)}>
                  Start free
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      <div className={cn(isTryWorkspace && 'min-h-0 flex-1 overflow-hidden')}>
        <Outlet />
      </div>

      {!isTryWorkspace && (
        <footer className="border-t border-border/60 mt-auto">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
            <div>
              <BrandLogo size={24} />
              <p className="mt-2 max-w-xs text-sm text-subtle">{BRAND.tagline}</p>
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-primary">Product</p>
                <a href="/#how" className="block text-subtle hover:text-accent">
                  How it works
                </a>
                <Link to="/try" className="block text-subtle hover:text-accent">
                  Try editor
                </Link>
                <Link to="/examples" className="block text-subtle hover:text-accent">
                  Examples
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
