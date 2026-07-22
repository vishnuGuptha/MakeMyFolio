import { Fragment, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SkillCategory } from '@/types';
import type { SkillsLayoutClassNames } from './SkillChipsLayout';

export function SkillCardsLayout({
  skills,
  classNames,
  horizontal,
  renderCard,
}: {
  skills: SkillCategory[];
  classNames?: SkillsLayoutClassNames;
  /** Horizontal scroll track (Olive-style) */
  horizontal?: boolean;
  renderCard?: (cat: SkillCategory, skillNames: string[]) => ReactNode;
}) {
  const cats = [...skills].sort((a, b) => a.order - b.order);

  const items = cats.map((cat) => {
    const names = [...cat.skills]
      .sort((a, b) => a.order - b.order)
      .map((s) => s.name)
      .filter(Boolean);
    if (renderCard) {
      return <Fragment key={cat._id}>{renderCard(cat, names)}</Fragment>;
    }
    return (
      <div
        key={cat._id}
        className={cn(
          'rounded-xl border border-border/50 bg-elevated/80 p-5 min-w-0',
          horizontal && 'min-w-[16rem] shrink-0',
          classNames?.card
        )}
      >
        <h3 className={cn('font-semibold text-base text-primary mb-3', classNames?.categoryTitle)}>{cat.name}</h3>
        <div className={cn('flex flex-wrap gap-2', classNames?.chipRow)}>
          {names.map((name) => (
            <span
              key={name}
              className={cn(
                'inline-flex rounded-full border border-border/50 bg-muted/30 px-2.5 py-0.5 text-xs text-secondary',
                classNames?.chip
              )}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    );
  });

  if (horizontal) {
    return (
      <div className={cn('flex gap-4 overflow-x-auto pb-2 scroll-smooth', classNames?.cardGrid, classNames?.root)}>
        {items}
      </div>
    );
  }

  return <div className={cn('grid md:grid-cols-2 gap-4', classNames?.cardGrid, classNames?.root)}>{items}</div>;
}
