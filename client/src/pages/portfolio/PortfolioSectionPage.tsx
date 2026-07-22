import { Navigate, useParams } from 'react-router-dom';
import { PortfolioSectionContent } from '@/components/portfolio/PortfolioSectionContent';
import { PortfolioAccessGate } from '@/components/portfolio/PortfolioAccessGate';
import {
  usePortfolioAccess,
  usePortfolioBasePath,
  usePortfolioData,
} from '@/context/PortfolioContext';
import { PORTFOLIO_NAV_SECTIONS, type NavSectionId } from '@/lib/theme';
import NotFoundPage from '@/pages/NotFoundPage';

export default function PortfolioSectionPage() {
  const { section } = useParams<{ section: string }>();
  const data = usePortfolioData();
  const basePath = usePortfolioBasePath();
  const { accessLocked, unlockWithCode } = usePortfolioAccess();
  const layoutMode = data.settings?.layoutMode || 'single-page';

  if (layoutMode === 'single-page' && section) {
    return <Navigate to={`${basePath}#${section}`} replace />;
  }

  const valid = PORTFOLIO_NAV_SECTIONS.find((s) => s.path === section);
  if (!valid) return <NotFoundPage />;

  if (accessLocked) {
    return <PortfolioAccessGate onUnlock={unlockWithCode} />;
  }

  const visible = data.settings?.sectionVisibility?.[valid.id] !== false;
  if (!visible) return <NotFoundPage />;

  return <PortfolioSectionContent section={valid.id as NavSectionId} data={data} />;
}
