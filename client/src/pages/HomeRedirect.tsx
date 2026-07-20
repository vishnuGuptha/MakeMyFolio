import { lazy, Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const MarketingHomePage = lazy(() => import('@/pages/marketing/MarketingHomePage'));

/**
 * Index under MarketingLayout — paint the marketing home immediately for guests.
 * Redirect signed-in users once auth resolves (do not block LCP on /me).
 */
export default function HomeRedirect() {
  const { user, loading } = useAuth();

  if (!loading && user?.role === 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!loading && user?.role === 'platform_admin') {
    return <Navigate to="/platform" replace />;
  }

  return (
    <Suspense fallback={null}>
      <MarketingHomePage />
    </Suspense>
  );
}
