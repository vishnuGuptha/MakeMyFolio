import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PricingPage from '@/pages/marketing/PricingPage';
import { buildAuthPath, DASHBOARD_CART_PATH } from '@/lib/planCheckout';

/** Guests see marketing pricing; signed-in users use dashboard shell. */
export function PricingRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'user') return <Navigate to="/dashboard/pricing" replace />;
  return <PricingPage />;
}

/** Cart is account-only — guests go to login. */
export function CartRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'user') return <Navigate to={DASHBOARD_CART_PATH} replace />;
  return <Navigate to={buildAuthPath('/login', { next: DASHBOARD_CART_PATH })} replace />;
}
