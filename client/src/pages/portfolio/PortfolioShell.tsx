import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { applyPortfolioFavicon, restoreDocumentFavicon } from '@/lib/favicon';
import { Tooltip } from '@/components/ui/Tooltip';
import { PORTFOLIO_NAV_SECTIONS } from '@/lib/theme';
import {
  clearUnlockToken,
  readUnlockToken,
  writeUnlockToken,
} from '@/components/portfolio/PortfolioAccessGate';

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
  const [unlocked, setUnlocked] = useState(false);

  const isPreview = mode === 'preview';
  const fetchKey = isPreview ? profileId : slug;

  useEffect(() => {
    if (!fetchKey) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setUnlocked(false);

    const load = async () => {
      if (isPreview) {
        return userApi.getPreview(fetchKey);
      }

      const token = slug ? readUnlockToken(slug) : null;
      if (token && slug) {
        try {
          const resumed = await publicApi.unlockPortfolio(slug, { token });
          const { unlockToken, ...portfolio } = resumed;
          writeUnlockToken(slug, unlockToken);
          if (!cancelled) setUnlocked(true);
          return portfolio;
        } catch {
          clearUnlockToken(slug);
        }
      }

      return publicApi.getPortfolio(fetchKey);
    };

    load()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        if (d.settings?.siteTitle) {
          document.title = isPreview ? `[Preview] ${d.settings.siteTitle}` : d.settings.siteTitle;
        }
        applyPortfolioFavicon({
          name: d.content?.name || d.profile.displayName,
          imageUrl: d.content?.profileImageUrl,
          accentColor: d.settings?.primaryColor,
          style: d.settings?.faviconStyle,
        });
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
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchKey, isPreview, slug]);

  useEffect(() => {
    if (!data) return;
    if (data.settings?.siteTitle) {
      document.title = isPreview ? `[Preview] ${data.settings.siteTitle}` : data.settings.siteTitle;
    }
    applyPortfolioFavicon({
      name: data.content?.name || data.profile.displayName,
      imageUrl: data.content?.profileImageUrl,
      accentColor: data.settings?.primaryColor,
      style: data.settings?.faviconStyle,
    });
  }, [data, location.pathname, isPreview]);

  useEffect(() => {
    return () => {
      restoreDocumentFavicon();
    };
  }, []);

  const unlockWithCode = useCallback(
    async (code: string) => {
      if (!slug) return;
      const result = await publicApi.unlockPortfolio(slug, { code });
      const { unlockToken, ...portfolio } = result;
      writeUnlockToken(slug, unlockToken);
      setData(portfolio);
      setUnlocked(true);
    },
    [slug]
  );

  const accessLocked = useMemo(() => {
    if (isPreview) return false;
    if (!data?.settings?.accessLockEnabled) return false;
    return !unlocked;
  }, [isPreview, data?.settings?.accessLockEnabled, unlocked]);

  const navVisibility = useMemo(() => {
    if (!accessLocked) return data?.settings?.sectionVisibility;
    return Object.fromEntries(PORTFOLIO_NAV_SECTIONS.map((s) => [s.id, false]));
  }, [accessLocked, data?.settings?.sectionVisibility]);

  if (loading) return <PortfolioSkeleton />;
  if (error || !data?.content) return <NotFoundPage />;

  const layoutMode = data.settings?.layoutMode || 'single-page';
  const portfolioTheme = (data.settings?.portfolioTheme || 'glass') as PortfolioThemeId;
  const onSubdomain =
    !isPreview && (isPortfolioSubdomainHost() || (Boolean(slugOverride) && usesSubdomainPortfolios()));
  const basePath =
    isPreview && profileId ? `/preview/${profileId}` : onSubdomain ? '' : `/${data.profile.slug}`;

  return (
    <PortfolioProvider
      data={data}
      basePath={basePath}
      isPreview={isPreview}
      accessLocked={accessLocked}
      unlockWithCode={unlockWithCode}
    >
      <PortfolioThemeProvider themeId={portfolioTheme} settings={data.settings}>
        <ThemeShell>
          {isPreview && (
            <Tooltip content="Back to dashboard — only you can see this draft">
              <Link
                to="/dashboard"
                className="home-cta-secondary fixed right-4 top-4 z-[100] inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary transition-colors hover:border-[#0066FF]/35 hover:text-[#0066FF]"
              >
                Draft
              </Link>
            </Tooltip>
          )}
          <ThemeNavbar
            name={data.content.name}
            slug={data.profile.slug}
            basePath={basePath}
            layoutMode={layoutMode}
            sectionVisibility={navVisibility}
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
