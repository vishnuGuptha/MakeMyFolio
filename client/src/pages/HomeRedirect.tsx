import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import MarketingHomePage from '@/pages/marketing/MarketingHomePage';

/** Index under MarketingLayout — send signed-in users to their app */
export default function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-24 text-center text-sm text-subtle">Loading…</div>;
  }

  if (user?.role === 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  if (user?.role === 'platform_admin') {
    return <Navigate to="/platform" replace />;
  }

  return <MarketingHomePage />;
}
