import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Box, LayoutGrid } from 'lucide-react';
import { usePortfolioData } from '@/context/PortfolioContext';
import { SpotlightContainer, SpotlightSection, SpotlightHeading } from '../layout/SpotlightSection';
import {
  resolveSkillsDisplayStyle,
  SkillBarsLayout,
  SkillCardsLayout,
  SkillChipsLayout,
  SkillRingsLayout,
} from '@/themes/shared/skills';
import type { SkillCategory } from '@/types';

const SkillsOrbit3D = lazy(() => import('../components/SkillsOrbit3D'));

function canUseWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (!window.matchMedia('(min-width: 768px)').matches) return false;
  if (!window.matchMedia('(pointer: fine)').matches) return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

export default function SpotlightSkillsSection({ skills }: { skills: SkillCategory[] }) {
  const { settings } = usePortfolioData();
  const style = resolveSkillsDisplayStyle('spotlight', settings?.skillsDisplayStyle);
  const reduceMotion = useReducedMotion();
  const [webglOk, setWebglOk] = useState(false);
  const [orbit, setOrbit] = useState(false);

  useEffect(() => {
    setWebglOk(canUseWebGL());
  }, []);

  const flatSkills = useMemo(
    () => skills.flatMap((c) => [...c.skills].sort((a, b) => a.order - b.order)),
    [skills]
  );

  const showOrbitToggle = style === 'rings' && webglOk && !reduceMotion;

  return (
    <SpotlightSection id="skills">
      <SpotlightContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SpotlightHeading
            number="02"
            title="Skills & Tools"
            subtitle="Pick a Skills layout in the editor — rings, chips, bars, or cards."
          />
          {showOrbitToggle ? (
            <div className="flex gap-2 mb-10" role="group" aria-label="Skills view mode">
              <button
                type="button"
                className={`spotlight-filter-chip inline-flex items-center gap-1.5 ${!orbit ? 'is-active' : ''}`}
                aria-pressed={!orbit}
                onClick={() => setOrbit(false)}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Rings
              </button>
              <button
                type="button"
                className={`spotlight-filter-chip inline-flex items-center gap-1.5 ${orbit ? 'is-active' : ''}`}
                aria-pressed={orbit}
                onClick={() => setOrbit(true)}
              >
                <Box className="h-3.5 w-3.5" /> 3D orbit
              </button>
            </div>
          ) : null}
        </div>

        {style === 'rings' && orbit && webglOk ? (
          <Suspense
            fallback={
              <div className="spotlight-skills-3d flex items-center justify-center text-sm text-subtle">Loading 3D…</div>
            }
          >
            <SkillsOrbit3D skills={flatSkills} />
          </Suspense>
        ) : style === 'bars' ? (
          <SkillBarsLayout skills={skills} classNames={{ category: 'spotlight-side-card p-5' }} />
        ) : style === 'cards' ? (
          <SkillCardsLayout skills={skills} classNames={{ card: 'spotlight-side-card' }} />
        ) : style === 'chips' ? (
          <SkillChipsLayout
            skills={skills}
            classNames={{
              chip: 'spotlight-skill-pill text-sm px-4 py-2 rounded-lg',
              categoryTitle: 'font-mono text-sm text-accent',
            }}
          />
        ) : (
          <SkillRingsLayout skills={skills} classNames={{ categoryTitle: 'font-mono text-sm text-accent' }} />
        )}
      </SpotlightContainer>
    </SpotlightSection>
  );
}
