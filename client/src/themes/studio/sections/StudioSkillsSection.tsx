import type { SkillCategory } from '@/types';
import StudioSection, { StudioSectionHeader } from '../layout/StudioSection';
import StudioTag from '../components/StudioTag';
import StudioEmptyState from '../components/StudioEmptyState';
import { usePortfolioData } from '@/context/PortfolioContext';
import {
  resolveSkillsDisplayStyle,
  SkillBarsLayout,
  SkillCardsLayout,
  SkillChipsLayout,
  SkillRingsLayout,
} from '@/themes/shared/skills';

export default function StudioSkillsSection({ skills }: { skills: SkillCategory[] }) {
  const { settings } = usePortfolioData();
  const style = resolveSkillsDisplayStyle('studio', settings?.skillsDisplayStyle);

  if (!skills?.length) return null;
  const sorted = [...skills].sort((a, b) => a.order - b.order);

  return (
    <StudioSection id="skills" band="dark">
      <StudioSectionHeader title="Skills" lead="Tools and platforms used across recent product work." />
      {!sorted.length ? (
        <StudioEmptyState title="No skills listed" />
      ) : style === 'rings' ? (
        <SkillRingsLayout skills={sorted} classNames={{ categoryTitle: 'font-bold text-[var(--band-ink)]' }} />
      ) : style === 'bars' ? (
        <div className="grid gap-6 md:grid-cols-2">
          <SkillBarsLayout
            skills={sorted}
            classNames={{ root: 'contents', categoryTitle: 'font-bold text-[var(--band-ink)]' }}
          />
        </div>
      ) : style === 'cards' ? (
        <SkillCardsLayout skills={sorted} />
      ) : (
        <SkillChipsLayout
          skills={sorted}
          classNames={{ root: 'grid gap-6 md:grid-cols-2 space-y-0', categoryTitle: 'font-bold mb-3 text-[var(--band-ink)]' }}
          renderChip={(skill) => <StudioTag label={skill.name} />}
        />
      )}
    </StudioSection>
  );
}
