import BentoCard from '../components/BentoCard';
import { BentoSection } from '../BentoSectionWrapper';
import type { SkillCategory } from '@/types';

export default function BentoSkillsSection({ skills }: { skills: SkillCategory[] }) {
  if (!skills?.length) return null;

  return (
    <BentoSection id="skills" label="02" title="Skills">
      <div className="grid md:grid-cols-2 gap-4">
        {skills.map((cat) => (
          <BentoCard key={cat._id} className="p-6">
            <h3 className="font-bold mb-4 text-base text-[var(--bento-ink)]">{cat.name}</h3>
            <div className="flex flex-wrap gap-2">
              {[...cat.skills]
                .sort((a, b) => a.order - b.order)
                .map((s) => (
                  <span key={s.name} className="bento-chip">
                    {s.name}
                    {s.level ? <span className="opacity-50 ml-1">· {s.level}</span> : null}
                  </span>
                ))}
            </div>
          </BentoCard>
        ))}
      </div>
    </BentoSection>
  );
}
