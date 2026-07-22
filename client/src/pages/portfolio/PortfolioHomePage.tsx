import { useEffect } from 'react';
import ThemeHero from '@/themes/ThemeHero';
import { PortfolioSectionContent } from '@/components/portfolio/PortfolioSectionContent';
import { PortfolioAccessGate } from '@/components/portfolio/PortfolioAccessGate';
import {
  usePortfolioAccess,
  usePortfolioBasePath,
  usePortfolioData,
} from '@/context/PortfolioContext';

export default function PortfolioHomePage() {
  const data = usePortfolioData();
  const basePath = usePortfolioBasePath();
  const { accessLocked, unlockWithCode } = usePortfolioAccess();
  const layoutMode = data.settings?.layoutMode || 'single-page';

  useEffect(() => {
    if (layoutMode !== 'single-page' || accessLocked) return;
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [layoutMode, accessLocked]);

  if (!data.content) return null;

  return (
    <>
      <ThemeHero content={data.content} slug={data.profile.slug} basePath={basePath} />
      {accessLocked ? (
        <PortfolioAccessGate onUnlock={unlockWithCode} />
      ) : (
        layoutMode === 'single-page' && <PortfolioSectionContent section="all" data={data} />
      )}
    </>
  );
}
