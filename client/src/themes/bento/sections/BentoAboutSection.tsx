import BentoCard from '../components/BentoCard';
import { BentoSection } from '../BentoSectionWrapper';
import type { ProfileContent } from '@/types';

function normalizeBio(bio: string) {
  return bio
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean);
}

export default function BentoAboutSection({
  content,
  showExperienceBadge = true,
}: {
  content: ProfileContent;
  showExperienceBadge?: boolean;
}) {
  const paragraphs = normalizeBio(content.bio || '');

  return (
    <BentoSection id="about" label="01" title="About">
      <div className="grid lg:grid-cols-[1.4fr_0.8fr] gap-4">
        <BentoCard className="p-6 md:p-8 space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm md:text-base leading-relaxed bento-muted">
              {p}
            </p>
          ))}
          {!paragraphs.length && (
            <p className="text-sm bento-muted">Add a bio in the CMS to populate this section.</p>
          )}
        </BentoCard>
        <div className="space-y-4">
          {showExperienceBadge && content.yearsExperience && (
            <BentoCard className="p-5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold bento-muted mb-1">
                Experience
              </p>
              <p className="text-xl font-bold text-[var(--bento-ink)]">{content.yearsExperience}</p>
            </BentoCard>
          )}
          {content.location && (
            <BentoCard variant="soft" className="p-5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold bento-muted mb-1">
                Location
              </p>
              <p className="font-semibold">{content.location}</p>
            </BentoCard>
          )}
          {content.educationHighlight && (
            <BentoCard variant="soft" className="p-5">
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold bento-muted mb-1">
                Education
              </p>
              <p className="font-semibold leading-snug">{content.educationHighlight}</p>
            </BentoCard>
          )}
        </div>
      </div>
    </BentoSection>
  );
}
