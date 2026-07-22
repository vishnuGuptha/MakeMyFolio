import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SkillCategory, SkillItem } from '@/types';

export type SkillsLayoutClassNames = {
  root?: string;
  category?: string;
  categoryTitle?: string;
  chipRow?: string;
  chip?: string;
  ringRow?: string;
  ring?: string;
  barRow?: string;
  barTrack?: string;
  barFill?: string;
  barLabel?: string;
  cardGrid?: string;
  card?: string;
};

function sortedSkills(cat: SkillCategory): SkillItem[] {
  return [...cat.skills].sort((a, b) => a.order - b.order);
}

function sortedCategories(skills: SkillCategory[]): SkillCategory[] {
  return [...skills].sort((a, b) => a.order - b.order);
}

export function SkillChipsLayout({
  skills,
  classNames,
  renderChip,
  renderCategory,
}: {
  skills: SkillCategory[];
  classNames?: SkillsLayoutClassNames;
  renderChip?: (skill: SkillItem) => ReactNode;
  renderCategory?: (cat: SkillCategory, body: ReactNode) => ReactNode;
}) {
  const cats = sortedCategories(skills);
  return (
    <div className={cn('space-y-8', classNames?.root)}>
      {cats.map((cat) => {
        const body = (
          <>
            <h3 className={cn('font-semibold text-sm mb-3 text-accent', classNames?.categoryTitle)}>{cat.name}</h3>
            <div className={cn('flex flex-wrap gap-2', classNames?.chipRow)}>
              {sortedSkills(cat).map((skill) =>
                renderChip ? (
                  <span key={skill.name}>{renderChip(skill)}</span>
                ) : (
                  <span
                    key={skill.name}
                    className={cn(
                      'inline-flex items-center rounded-full border border-border bg-elevated px-3 py-1.5 text-sm text-primary shadow-sm',
                      classNames?.chip
                    )}
                  >
                    {skill.name}
                    {skill.level ? <span className="ml-1.5 text-[10px] uppercase text-subtle">{skill.level}</span> : null}
                  </span>
                )
              )}
            </div>
          </>
        );
        return (
          <div key={cat._id} className={cn(classNames?.category)}>
            {renderCategory ? renderCategory(cat, body) : body}
          </div>
        );
      })}
    </div>
  );
}
