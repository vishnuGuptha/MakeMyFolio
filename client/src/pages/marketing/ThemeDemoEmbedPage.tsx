import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  createDemoGuestDraft,
  fetchDemoGuestDraft,
  guestDraftToPortfolioData,
  type GuestDraft,
} from '@/context/GuestDraftContext';
import { PortfolioProvider } from '@/context/PortfolioContext';
import { PortfolioThemeProvider } from '@/context/PortfolioThemeContext';
import PortfolioHomePage from '@/pages/portfolio/PortfolioHomePage';
import ThemeShell from '@/themes/ThemeShell';
import ThemeNavbar from '@/themes/ThemeNavbar';
import ThemeFooter from '@/themes/ThemeFooter';
import type { PortfolioThemeId } from '@/themes/types';
import { cn } from '@/lib/utils';

const THEME_IDS = new Set<string>([
  'glass',
  'spotlight',
  'terminal',
  'command-center',
  'bento',
  'studio',
  'olive',
]);

/** Isolated iframe page — real theme UI with demo data (for marketing cards). */
export default function ThemeDemoEmbedPage() {
  const { themeId: rawId } = useParams();
  const themeId = (THEME_IDS.has(rawId || '') ? rawId : 'studio') as PortfolioThemeId;
  const [draft, setDraft] = useState<GuestDraft>(() => createDemoGuestDraft(themeId));

  useEffect(() => {
    let cancelled = false;
    void fetchDemoGuestDraft(themeId).then((seed) => {
      if (!cancelled) setDraft(seed);
    });
    return () => {
      cancelled = true;
    };
  }, [themeId]);

  const data = guestDraftToPortfolioData(draft);

  useEffect(() => {
    document.documentElement.classList.add('guest-preview-embed');
    document.body.classList.add('guest-preview-embed');
    // Ensure iframe document can scroll the portfolio body
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    return () => {
      document.documentElement.classList.remove('guest-preview-embed');
      document.body.classList.remove('guest-preview-embed');
      document.documentElement.style.height = '';
      document.body.style.height = '';
    };
  }, []);

  if (!data.content) return null;

  const layoutMode = data.settings?.layoutMode || 'single-page';
  const portfolioTheme = (data.settings?.portfolioTheme || themeId) as PortfolioThemeId;
  const basePath = `/theme-demo/${themeId}`;

  return (
    <PortfolioProvider data={data} basePath={basePath} isPreview>
      <PortfolioThemeProvider themeId={portfolioTheme} settings={data.settings}>
        <ThemeShell>
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
