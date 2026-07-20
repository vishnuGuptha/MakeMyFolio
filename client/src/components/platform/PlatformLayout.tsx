import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Activity, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { AppThemeToggle } from '@/components/ui/AppThemeToggle';
import { BrandLogo } from '@/brand/logo';
import { cn } from '@/lib/utils';
import { resetDocumentThemeForAdmin } from '@/lib/theme';
import { useEffect } from 'react';

const NAV = [
  { to: '/platform', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/platform/users', label: 'Users', icon: Users },
  { to: '/platform/portfolios', label: 'Portfolios', icon: Briefcase },
  { to: '/platform/try-demo', label: 'Try demo', icon: Sparkles },
  { to: '/platform/activity', label: 'Activity', icon: Activity },
];

export default function PlatformLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    resetDocumentThemeForAdmin();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/platform/login');
  };

  return (
    <div className="dashboard-shell flex min-h-screen bg-base text-primary">
      <aside className="dashboard-sidebar flex w-64 shrink-0 flex-col">
        <div className="border-b border-[#0066FF]/10 p-4 dark:border-white/10">
          <BrandLogo size={24} />
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
            Platform Admin
          </p>
          <p className="mt-1 text-xs text-subtle">Monitor users & portfolios</p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-[#0066FF]/12 font-medium text-[#0066FF] ring-1 ring-inset ring-[#0066FF]/20'
                    : 'text-secondary hover:bg-muted hover:text-primary'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[#0066FF]/10 p-2 dark:border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-secondary transition-colors hover:bg-muted hover:text-primary"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="dashboard-header flex h-14 items-center justify-between px-6">
          <p className="font-mono text-sm text-subtle">Platform Control Center</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-subtle">{user?.email}</span>
            <AppThemeToggle />
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
