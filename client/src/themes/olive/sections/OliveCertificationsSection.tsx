import { usePortfolioData } from '@/context/PortfolioContext';
import type { Certification } from '@/types';
import OliveSection, { OliveSectionHeader } from '../components/OliveSection';
import OliveEmptyState from '../components/OliveEmptyState';
import { OliveCertBadges } from '../components/OliveContactBlocks';

export default function OliveCertificationsSection({
  certifications,
}: {
  certifications: Certification[];
}) {
  const { settings } = usePortfolioData();
  const isSingle = (settings?.layoutMode || 'single-page') === 'single-page';

  // Single-page: badges sit under contact in the Experience split (Figma layout).
  if (isSingle) return null;

  const sorted = [...(certifications || [])].sort((a, b) => a.order - b.order);

  return (
    <OliveSection id="certifications" panel="island">
      <OliveSectionHeader title="Certifications" />
      {!sorted.length ? (
        <OliveEmptyState title="No certifications yet" hint="Add certifications in the CMS." />
      ) : (
        <OliveCertBadges certifications={sorted} />
      )}
    </OliveSection>
  );
}
