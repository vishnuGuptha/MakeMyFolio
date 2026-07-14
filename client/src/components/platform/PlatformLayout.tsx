import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, Activity, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

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

  const handleLogout = async () => {
    await logout();
    navigate('/platform/login');
  };

  return (
    <div className="min-h-screen bg-base flex">
      <aside className="w-64 border-r border-border bg-elevated flex flex-col">
        <div className="p-4 border-b border-border">
          <span className="font-mono text-sm text-brand-secondary font-semibold">Platform Admin</span>
          <p className="text-xs text-subtle mt-1">Monitor all users & portfolios</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-brand-secondary/15 text-brand-secondary' : 'text-secondary hover:bg-muted'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-between px-6">
          <p className="text-sm text-subtle font-mono">Platform Control Center</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-subtle">{user?.email}</span>
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
