import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const AtmosphereCanvas = lazy(() => import('./HeroAtmosphereCanvas'));

/**
 * Lazy Three.js particle atmosphere behind the home hero.
 * Skipped for reduced-motion / when offscreen.
 */
export function HeroAtmosphere({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [host, setHost] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!host || reduceMotion) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: '80px', threshold: 0.05 }
    );
    io.observe(host);
    return () => io.disconnect();
  }, [host, reduceMotion]);

  const enabled = useMemo(() => !reduceMotion && visible, [reduceMotion, visible]);

  if (reduceMotion) return null;

  return (
    <div
      ref={setHost}
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
      aria-hidden
    >
      {enabled && (
        <Suspense fallback={null}>
          <AtmosphereCanvas />
        </Suspense>
      )}
    </div>
  );
}
