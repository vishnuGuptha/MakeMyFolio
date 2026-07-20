import { useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { RESERVED_APP_PATHS } from '@/brand/constants';
import { getPortfolioSlugFromHost, usesSubdomainPortfolios } from '@/lib/domains';
import { getPublicPortfolioUrl } from '@/lib/utils';
import PortfolioHomePage from '@/pages/portfolio/PortfolioHomePage';
import PortfolioSectionPage from '@/pages/portfolio/PortfolioSectionPage';
import PortfolioShell from '@/pages/portfolio/PortfolioShell';

/** On apex domain: redirect `/{slug}` → `{slug}.domain` when subdomain mode is enabled. */
function PathToSubdomainRedirect({ slug, section }: { slug: string; section?: string }) {
  useEffect(() => {
    window.location.replace(getPublicPortfolioUrl(slug, section));
  }, [slug, section]);

  return <div className="py-24 text-center text-sm text-subtle">Redirecting to your portfolio…</div>;
}

function isReservedSlug(slug: string) {
  return (RESERVED_APP_PATHS as readonly string[]).includes(slug);
}

/** Gate on apex `/{slug}` — redirects to subdomain or renders nested portfolio routes. */
export default function PublicPortfolioEntry() {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();

  if (!paramSlug || isReservedSlug(paramSlug)) {
    return <Navigate to="/not-found" replace />;
  }

  if (usesSubdomainPortfolios()) {
    const sectionFromPath = location.pathname.replace(`/${paramSlug}`, '').replace(/^\//, '') || undefined;
    return <PathToSubdomainRedirect slug={paramSlug} section={sectionFromPath} />;
  }

  return <Outlet />;
}

/** Routes for `{slug}.buildmyfolio.com` tenants. */
export function SubdomainPortfolioRoutes() {
  const hostSlug = getPortfolioSlugFromHost();
  if (!hostSlug) return null;

  return (
    <Routes>
      <Route element={<PortfolioShell slugOverride={hostSlug} />}>
        <Route index element={<PortfolioHomePage />} />
        <Route path=":section" element={<PortfolioSectionPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
