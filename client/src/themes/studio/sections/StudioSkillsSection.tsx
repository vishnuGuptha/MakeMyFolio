import type { SkillCategory } from '@/types';
import StudioSection, { StudioSectionHeader } from '../layout/StudioSection';
import StudioTag from '../components/StudioTag';
import StudioEmptyState from '../components/StudioEmptyState';

export default function StudioSkillsSection({ skills }: { skills: SkillCategory[] }) {
  if (!skills?.length) return null;
  const sorted = [...skills].sort((a, b) => a.order - b.order);

  return (
    <StudioSection id="skills" band="dark">
      <StudioSectionHeader title="Skills" lead="Tools and platforms used across recent product work." />
      {!sorted.length ? (
        <StudioEmptyState title="No skills listed" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sorted.map((cat) => (
            <div key={cat._id}>
              <h3 className="font-bold mb-3 text-[var(--band-ink)]">{cat.name}</h3>
              <div className="flex flex-wrap gap-2">
                {[...cat.skills]
                  .sort((a, b) => a.order - b.order)
                  .map((s) => (
                    <StudioTag key={s.name} label={s.name} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </StudioSection>
  );
}
