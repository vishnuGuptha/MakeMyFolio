import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui/PageLoader';

export default function RequirePlatformAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader variant="page" label="Checking your session" />;
  }

  if (!user || user.role !== 'platform_admin') return <Navigate to="/platform/login" replace />;
  return <>{children}</>;
}
