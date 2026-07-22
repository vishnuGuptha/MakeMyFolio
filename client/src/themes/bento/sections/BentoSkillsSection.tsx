import BentoCard from '../components/BentoCard';
import { BentoSection } from '../BentoSectionWrapper';
import { usePortfolioData } from '@/context/PortfolioContext';
import {
  resolveSkillsDisplayStyle,
  SkillBarsLayout,
  SkillCardsLayout,
  SkillChipsLayout,
  SkillRingsLayout,
} from '@/themes/shared/skills';
import type { SkillCategory } from '@/types';

export default function BentoSkillsSection({ skills }: { skills: SkillCategory[] }) {
  const { settings } = usePortfolioData();
  const style = resolveSkillsDisplayStyle('bento', settings?.skillsDisplayStyle);

  if (!skills?.length) return null;

  return (
    <BentoSection id="skills" label="02" title="Skills">
      {style === 'rings' ? (
        <SkillRingsLayout
          skills={skills}
          classNames={{ categoryTitle: 'font-bold text-base text-[var(--bento-ink)]' }}
          renderCategory={(_cat, body) => <BentoCard className="p-6 mb-4">{body}</BentoCard>}
        />
      ) : style === 'bars' ? (
        <SkillBarsLayout
          skills={skills}
          classNames={{ categoryTitle: 'font-bold text-base text-[var(--bento-ink)]', barFill: 'bg-[var(--bento-accent,#14B8A6)]' }}
          renderCategory={(_cat, body) => <BentoCard className="p-6 mb-4">{body}</BentoCard>}
        />
      ) : style === 'cards' ? (
        <SkillCardsLayout
          skills={skills}
          renderCard={(cat, names) => (
            <BentoCard className="p-6 h-full">
              <h3 className="font-bold mb-4 text-base text-[var(--bento-ink)]">{cat.name}</h3>
              <div className="flex flex-wrap gap-2">
                {names.map((n) => (
                  <span key={n} className="bento-chip">
                    {n}
                  </span>
                ))}
              </div>
            </BentoCard>
          )}
        />
      ) : (
        <SkillChipsLayout
          skills={skills}
          classNames={{ root: 'grid md:grid-cols-2 gap-4 space-y-0', categoryTitle: 'font-bold mb-4 text-base text-[var(--bento-ink)]' }}
          renderCategory={(_cat, body) => <BentoCard className="p-6">{body}</BentoCard>}
          renderChip={(skill) => (
            <span className="bento-chip">
              {skill.name}
              {skill.level ? <span className="opacity-50 ml-1">· {skill.level}</span> : null}
            </span>
          )}
        />
      )}
    </BentoSection>
  );
}
