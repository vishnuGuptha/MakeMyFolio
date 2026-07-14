import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function RequirePlatformAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="animate-pulse text-subtle font-mono text-sm">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'platform_admin') return <Navigate to="/platform/login" replace />;
  return <>{children}</>;
}
