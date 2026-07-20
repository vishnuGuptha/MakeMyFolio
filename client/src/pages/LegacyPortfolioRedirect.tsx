import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usesSubdomainPortfolios } from '@/lib/domains';
import { getPublicPortfolioUrl } from '@/lib/utils';

/** Redirect legacy `/p/{slug}` URLs to the current public portfolio URL format. */
export default function LegacyPortfolioRedirect() {
  const location = useLocation();
  const parts = location.pathname.replace(/^\/p\/?/, '').split('/').filter(Boolean);
  const slug = parts[0];
  const section = parts[1];

  useEffect(() => {
    if (usesSubdomainPortfolios() && slug) {
      window.location.replace(getPublicPortfolioUrl(slug, section));
    }
  }, [slug, section]);

  if (usesSubdomainPortfolios() && slug) {
    return <div className="py-24 text-center text-sm text-subtle">Redirecting…</div>;
  }

  const nextPath = location.pathname.replace(/^\/p(?=\/|$)/, '') || '/';
  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
}
