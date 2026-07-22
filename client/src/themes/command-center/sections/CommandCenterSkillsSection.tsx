import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  CommandCenterContainer,
  CommandCenterSection,
  CommandCenterHeading,
} from '../layout/CommandCenterSection';
import GlassCard from '../components/GlassCard';
import { usePortfolioData } from '@/context/PortfolioContext';
import {
  resolveSkillsDisplayStyle,
  SkillBarsLayout,
  SkillCardsLayout,
  SkillChipsLayout,
  SkillRingsLayout,
} from '@/themes/shared/skills';
import type { SkillCategory } from '@/types';

export default function CommandCenterSkillsSection({ skills }: { skills: SkillCategory[] }) {
  const { settings } = usePortfolioData();
  const style = resolveSkillsDisplayStyle('command-center', settings?.skillsDisplayStyle);

  if (!skills.length) return null;

  const wrap = (cat: SkillCategory, body: ReactNode, i: number) => (
    <motion.div
      key={cat._id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.04 }}
    >
      <GlassCard hover={false}>{body}</GlassCard>
    </motion.div>
  );

  return (
    <CommandCenterSection id="skills">
      <CommandCenterContainer>
        <CommandCenterHeading number="02" title="Skills" />
        {style === 'rings' ? (
          <div className="grid md:grid-cols-2 gap-4">
            <SkillRingsLayout
              skills={skills}
              classNames={{ root: 'contents', category: '' }}
              renderCategory={(cat, body) => wrap(cat, body, skills.indexOf(cat))}
            />
          </div>
        ) : style === 'chips' ? (
          <div className="grid md:grid-cols-2 gap-4">
            <SkillChipsLayout
              skills={skills}
              classNames={{ root: 'contents' }}
              renderCategory={(cat, body) => wrap(cat, body, skills.indexOf(cat))}
            />
          </div>
        ) : style === 'cards' ? (
          <SkillCardsLayout skills={skills} />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <SkillBarsLayout
              skills={skills}
              classNames={{ root: 'contents', categoryTitle: 'text-sm font-semibold text-accent mb-4' }}
              renderCategory={(cat, body) => wrap(cat, body, skills.indexOf(cat))}
            />
          </div>
        )}
      </CommandCenterContainer>
    </CommandCenterSection>
  );
}
