import { motion } from 'framer-motion';
import { CommandCenterContainer, CommandCenterSection, CommandCenterHeading } from '../layout/CommandCenterSection';
import GlassCard from '../components/GlassCard';
import MetricPanel from '../components/MetricPanel';
import type { ProfileContent } from '@/types';

/** Collapse single line-breaks in CMS bio into flowing paragraphs */
function formatBio(text: string): string[] {
  return text
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

export default function CommandCenterAboutSection({
  content,
  showExperienceBadge = true,
}: {
  content: ProfileContent;
  showExperienceBadge?: boolean;
}) {
  const bioParagraphs = formatBio(content.bio || content.tagline || '');
  const hasSideMeta =
    (showExperienceBadge && content.yearsExperience) || Boolean(content.educationHighlight);

  return (
    <CommandCenterSection id="about">
      <CommandCenterContainer>
        <CommandCenterHeading number="01" title="About" />
        <div className="grid lg:grid-cols-[1fr_280px] gap-4 lg:gap-6 items-stretch">
          <GlassCard hover={false} className="h-full">
            <div className="text-subtle leading-relaxed space-y-4">
              {bioParagraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </GlassCard>

          {content.profileImageUrl && (
            <GlassCard hover={false} className="h-full p-3 flex">
              <img
                src={content.profileImageUrl}
                alt={content.name}
                className="w-full h-full min-h-[240px] rounded-xl object-cover"
              />
            </GlassCard>
          )}
        </div>

        {hasSideMeta && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 gap-4 mt-4"
          >
            {showExperienceBadge && content.yearsExperience && (
              <GlassCard hover={false}>
                <MetricPanel label="Experience" value={`${content.yearsExperience}+ Years`} progress={70} />
              </GlassCard>
            )}
            {content.educationHighlight && (
              <GlassCard hover={false}>
                <p className="text-xs text-subtle mb-1">Education</p>
                <p className="text-sm text-primary font-medium">{content.educationHighlight}</p>
              </GlassCard>
            )}
          </motion.div>
        )}
      </CommandCenterContainer>
    </CommandCenterSection>
  );
}
