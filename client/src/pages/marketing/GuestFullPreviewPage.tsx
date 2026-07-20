import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetDocumentThemeForAdmin } from '@/lib/theme';
import {
  guestDraftToPortfolioData,
  readGuestPreviewDraft,
} from '@/context/GuestDraftContext';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { PortfolioThemeProvider } from '@/context/PortfolioThemeContext';
import PortfolioHomePage from '@/pages/portfolio/PortfolioHomePage';
import ThemeShell from '@/themes/ThemeShell';
import ThemeNavbar from '@/themes/ThemeNavbar';
import ThemeFooter from '@/themes/ThemeFooter';
import { BRAND } from '@/brand/constants';
import { Button } from '@/components/ui/Button';
import type { PortfolioThemeId } from '@/themes/types';
import { cn } from '@/lib/utils';

/** Full-theme guest portfolio — new tab, or embedded in try device frame (`?embed=1`). */
export default function GuestFullPreviewPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const embed = params.get('embed') === '1';
  const [tick, setTick] = useState(0);
  const draft = useMemo(() => readGuestPreviewDraft(), [tick]);
  const data = useMemo(() => (draft ? guestDraftToPortfolioData(draft) : null), [draft]);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'buildmyfolio-guest-preview' || e.key === null) bump();
    };
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'buildmyfolio-guest-refresh') bump();
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('message', onMessage);
    const id = window.setInterval(bump, embed ? 800 : 1500);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('message', onMessage);
      window.clearInterval(id);
      if (!embed) resetDocumentThemeForAdmin();
    };
  }, [embed]);

  useEffect(() => {
    if (!embed) return;
    document.documentElement.classList.add('guest-preview-embed');
    document.body.classList.add('guest-preview-embed');
    return () => {
      document.documentElement.classList.remove('guest-preview-embed');
      document.body.classList.remove('guest-preview-embed');
    };
  }, [embed]);

  useEffect(() => {
    if (!data?.settings) return;
    if (!embed) {
      document.title = `[Guest] ${data.settings.siteTitle || BRAND.name}`;
    }
  }, [data, embed]);

  if (!draft || !data?.content) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-4 bg-base px-6 text-center',
          embed ? 'min-h-[420px]' : 'min-h-svh'
        )}
      >
        <p className="text-sm text-subtle">Waiting for draft…</p>
        {!embed && (
          <Button type="button" className="home-cta-primary border-0 hover:bg-transparent" onClick={() => navigate('/try')}>
            Back to try editor
          </Button>
        )}
      </div>
    );
  }

  const layoutMode = data.settings?.layoutMode || 'single-page';
  const portfolioTheme = (data.settings?.portfolioTheme || 'olive') as PortfolioThemeId;
  const basePath = '/try/preview';

  return (
    <PortfolioProvider data={data} basePath={basePath} isPreview>
      <PortfolioThemeProvider themeId={portfolioTheme} settings={data.settings}>
        <ThemeShell>
          {!embed && (
            <Link
              to="/try"
              className="home-cta-secondary fixed right-4 top-4 z-[100] inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-secondary transition-colors hover:border-[#0066FF]/35 hover:text-[#0066FF]"
              title="Back to try editor"
            >
              Preview / Demo mode
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
            <PortfolioHomePage />
          </main>
          <ThemeFooter content={data.content} />
        </ThemeShell>
      </PortfolioThemeProvider>
    </PortfolioProvider>
  );
}
