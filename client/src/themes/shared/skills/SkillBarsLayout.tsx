import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SkillCategory } from '@/types';
import { skillLevelPercent } from './skillLevelPercent';
import type { SkillsLayoutClassNames } from './SkillChipsLayout';

export function SkillBarsLayout({
  skills,
  classNames,
  renderCategory,
}: {
  skills: SkillCategory[];
  classNames?: SkillsLayoutClassNames;
  renderCategory?: (cat: SkillCategory, body: ReactNode) => ReactNode;
}) {
  const cats = [...skills].sort((a, b) => a.order - b.order);

  return (
    <div className={cn('space-y-8', classNames?.root)}>
      {cats.map((cat) => {
        const body = (
          <>
            <h3 className={cn('font-semibold text-sm mb-4 text-accent', classNames?.categoryTitle)}>{cat.name}</h3>
            <div className={cn('space-y-3', classNames?.barRow)}>
              {[...cat.skills]
                .sort((a, b) => a.order - b.order)
                .map((skill) => {
                  const pct = skillLevelPercent(skill.level);
                  return (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={cn('text-sm text-primary', classNames?.barLabel)}>{skill.name}</span>
                        <span className="text-[10px] text-subtle tabular-nums">{skill.level || `${pct}%`}</span>
                      </div>
                      <div
                        className={cn(
                          'skills-bar-track h-1.5 rounded-full overflow-hidden bg-muted/50',
                          classNames?.barTrack
                        )}
                      >
                        <div
                          className={cn('skills-bar-fill h-full rounded-full bg-accent', classNames?.barFill)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
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
