import { Navigate, useLocation } from 'react-router-dom';

/** Redirect legacy `/p/{slug}` URLs to the short `/{slug}` form. */
export default function LegacyPortfolioRedirect() {
  const location = useLocation();
  const nextPath = location.pathname.replace(/^\/p(?=\/|$)/, '') || '/';
  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
}
