import { useEffect, useState } from 'react';
import { Link, Outlet, useParams, useLocation } from 'react-router-dom';
import { publicApi, userApi } from '@/api';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { PortfolioThemeProvider } from '@/context/PortfolioThemeContext';
import type { PortfolioData } from '@/types';
import { PortfolioSkeleton } from '@/components/ui/Skeleton';
import ThemeShell from '@/themes/ThemeShell';
import ThemeNavbar from '@/themes/ThemeNavbar';
import ThemeFooter from '@/themes/ThemeFooter';
import NotFoundPage from '@/pages/NotFoundPage';
import type { PortfolioThemeId } from '@/themes/types';
import { cn } from '@/lib/utils';
import { isPortfolioSubdomainHost, usesSubdomainPortfolios } from '@/lib/domains';

type ShellMode = 'public' | 'preview';

export default function PortfolioShell({
  mode = 'public',
  slugOverride,
}: {
  mode?: ShellMode;
  slugOverride?: string;
}) {
  const { slug: paramSlug, profileId } = useParams<{ slug?: string; profileId?: string }>();
  const slug = slugOverride ?? paramSlug;
  const location = useLocation();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isPreview = mode === 'preview';
  const fetchKey = isPreview ? profileId : slug;

  useEffect(() => {
    if (!fetchKey) return;
    setLoading(true);
    setError(false);

    const load = isPreview
      ? userApi.getPreview(fetchKey)
      : publicApi.getPortfolio(fetchKey);

    load
      .then((d) => {
        setData(d);
        if (d.settings?.siteTitle) {
          document.title = isPreview ? `[Preview] ${d.settings.siteTitle}` : d.settings.siteTitle;
        }
        if (d.settings?.metaDescription) {
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', d.settings.metaDescription);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [fetchKey, isPreview]);

  useEffect(() => {
    if (data?.settings?.siteTitle) {
      document.title = isPreview ? `[Preview] ${data.settings.siteTitle}` : data.settings.siteTitle;
    }
  }, [data, location.pathname, isPreview]);

  if (loading) return <PortfolioSkeleton />;
  if (error || !data?.content) return <NotFoundPage />;

  const layoutMode = data.settings?.layoutMode || 'single-page';
  const portfolioTheme = (data.settings?.portfolioTheme || 'glass') as PortfolioThemeId;
  const onSubdomain =
    !isPreview && (isPortfolioSubdomainHost() || (Boolean(slugOverride) && usesSubdomainPortfolios()));
  const basePath =
    isPreview && profileId ? `/preview/${profileId}` : onSubdomain ? '' : `/${data.profile.slug}`;

  return (
    <PortfolioProvider data={data} basePath={basePath} isPreview={isPreview}>
      <PortfolioThemeProvider themeId={portfolioTheme} settings={data.settings}>
        <ThemeShell>
          {isPreview && (
            <Link
              to="/dashboard"
              className="home-cta-secondary fixed right-4 top-4 z-[100] inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary transition-colors hover:border-[#0066FF]/35 hover:text-[#0066FF]"
              title="Back to dashboard — only you can see this draft"
            >
              Draft
            </Link>
          )}
          <ThemeNavbar
            name={data.content.name}
            slug={data.profile.slug}
            basePath={basePath}
            layoutMode={layoutMode}
            sectionVisibility={data.settings?.sectionVisibility}
            profileImageUrl={data.content.profileImageUrl}
            resumeUrl={data.content.resumeUrl}
          />
          <main
            className={cn(
              'relative z-10',
              portfolioTheme === 'studio' || portfolioTheme === 'olive' ? 'pt-0' : 'pt-16'
            )}
          >
            <Outlet context={{ data, layoutMode }} />
          </main>
          <ThemeFooter content={data.content} />
        </ThemeShell>
      </PortfolioThemeProvider>
    </PortfolioProvider>
  );
}
