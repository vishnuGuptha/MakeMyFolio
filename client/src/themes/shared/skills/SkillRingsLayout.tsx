import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SkillCategory, SkillItem } from '@/types';
import { skillLevelPercent } from './skillLevelPercent';
import type { SkillsLayoutClassNames } from './SkillChipsLayout';

const R = 42;
const C = 2 * Math.PI * R;

function SkillRing({
  skill,
  className,
}: {
  skill: SkillItem;
  className?: string;
}) {
  const pct = skillLevelPercent(skill.level);
  const offset = C * (1 - pct / 100);

  return (
    <button
      type="button"
      className={cn('skills-ring group', className)}
      aria-label={`${skill.name}${skill.level ? `, ${skill.level}` : ''}`}
    >
      <svg viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r={R} fill="none" className="skills-ring-track" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          className="skills-ring-fill"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="skills-ring-label">
        <p className="text-[11px] font-semibold text-primary leading-tight line-clamp-2">{skill.name}</p>
        {skill.level ? (
          <p className="skills-ring-hint text-[9px] uppercase tracking-wide text-subtle">{skill.level}</p>
        ) : (
          <p className="skills-ring-hint text-[9px] text-subtle">{pct}%</p>
        )}
      </div>
    </button>
  );
}

export function SkillRingsLayout({
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
    <div className={cn('space-y-10', classNames?.root)}>
      {cats.map((cat) => {
        const sorted = [...cat.skills].sort((a, b) => a.order - b.order);
        const primary = sorted.slice(0, 10);
        const overflow = sorted.slice(10);
        const body = (
          <>
            <h3 className={cn('font-semibold text-sm mb-4 text-accent', classNames?.categoryTitle)}>{cat.name}</h3>
            <div className={cn('flex flex-wrap gap-4', classNames?.ringRow)}>
              {primary.map((skill) => (
                <SkillRing key={skill.name} skill={skill} className={classNames?.ring} />
              ))}
            </div>
            {overflow.length > 0 ? (
              <div className={cn('flex flex-wrap gap-2 mt-4', classNames?.chipRow)}>
                {overflow.map((skill) => (
                  <span
                    key={skill.name}
                    className={cn(
                      'inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-sm',
                      classNames?.chip
                    )}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : null}
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
