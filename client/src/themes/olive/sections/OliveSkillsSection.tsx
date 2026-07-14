import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Brush,
  Rocket,
  Truck,
  Layers,
  Cpu,
  Sparkles,
  Code2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { SkillCategory } from '@/types';
import OliveSection, { OliveSectionHeader } from '../components/OliveSection';
import OliveEmptyState, { OliveSkillCard } from '../components/OliveEmptyState';

const ICONS: ReactNode[] = [
  <BarChart3 key="chart" className="h-8 w-8" strokeWidth={1.6} />,
  <Brush key="brush" className="h-8 w-8" strokeWidth={1.6} />,
  <Rocket key="rocket" className="h-8 w-8" strokeWidth={1.6} />,
  <Truck key="truck" className="h-8 w-8" strokeWidth={1.6} />,
  <Layers key="layers" className="h-8 w-8" strokeWidth={1.6} />,
  <Cpu key="cpu" className="h-8 w-8" strokeWidth={1.6} />,
  <Sparkles key="sparkles" className="h-8 w-8" strokeWidth={1.6} />,
  <Code2 key="code" className="h-8 w-8" strokeWidth={1.6} />,
];

function categoryDescription(cat: SkillCategory) {
  const names = [...cat.skills]
    .sort((a, b) => a.order - b.order)
    .map((s) => s.name)
    .filter(Boolean);
  if (!names.length) return 'Skills and tools in this category.';
  return names.join(', ');
}

export default function OliveSkillsSection({ skills }: { skills: SkillCategory[] }) {
  const sorted = useMemo(
    () => [...(skills || [])].sort((a, b) => a.order - b.order),
    [skills]
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncNav = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    syncNav();
    el.addEventListener('scroll', syncNav, { passive: true });
    const ro = new ResizeObserver(syncNav);
    ro.observe(el);

    // Map vertical wheel/trackpad gestures to horizontal scroll while over the carousel
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      const horizontalIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = horizontalIntent ? e.deltaX : e.deltaY;
      if (!delta) return;
      const atStart = el.scrollLeft <= 0 && delta < 0;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 && delta > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      el.scrollBy({ left: delta, behavior: 'auto' });
    };
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('scroll', syncNav);
      el.removeEventListener('wheel', onWheel);
      ro.disconnect();
    };
  }, [sorted.length, syncNav]);

  const scrollByPage = (direction: -1 | 1) => {
    const el = viewportRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.92, 240);
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  return (
    <OliveSection id="skills" panel="island" className="olive-section-skills">
      <OliveSectionHeader title="Core skills" />
      {!sorted.length ? (
        <OliveEmptyState
          title="No skills yet"
          hint="Add skill categories in the Skills editor to populate this carousel."
        />
      ) : (
        <div className="olive-skill-carousel" aria-label="Skill categories carousel">
          <button
            type="button"
            className="olive-skill-nav"
            aria-label="Previous skills"
            disabled={!canPrev}
            onClick={() => scrollByPage(-1)}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>

          <div ref={viewportRef} className="olive-skill-viewport" tabIndex={0}>
            <div className="olive-skill-track">
              {sorted.map((cat, i) => (
                <OliveSkillCard
                  key={cat._id}
                  title={cat.name}
                  description={categoryDescription(cat)}
                  icon={ICONS[i % ICONS.length]}
                  variant={i === 0 ? 'accent' : 'slate'}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            className="olive-skill-nav"
            aria-label="Next skills"
            disabled={!canNext}
            onClick={() => scrollByPage(1)}
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      )}
    </OliveSection>
  );
}
