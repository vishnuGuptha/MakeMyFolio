import { useEffect, useRef } from 'react';
import { useReducedMotion, useScroll, useSpring, useTransform, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Premium CSS/GPU hero backdrop — animated mesh, floating orbs, mouse spotlight.
 * No Three.js; transform3d + opacity only.
 */
export function HeroBackdrop({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start start', 'end start'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 30, mass: 0.4 });
  const ySlow = useTransform(smooth, [0, 1], reduceMotion ? [0, 0] : [0, 80]);
  const yMid = useTransform(smooth, [0, 1], reduceMotion ? [0, 0] : [0, 140]);
  const yFast = useTransform(smooth, [0, 1], reduceMotion ? [0, 0] : [0, 200]);

  useEffect(() => {
    if (reduceMotion) return;
    const el = rootRef.current;
    if (!el) return;

    let raf = 0;
    let targetX = 50;
    let targetY = 40;
    let curX = 50;
    let curY = 40;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;
    };

    const tick = () => {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      el.style.setProperty('--spot-x', `${curX}%`);
      el.style.setProperty('--spot-y', `${curY}%`);
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={rootRef}
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
      aria-hidden
      style={
        {
          '--spot-x': '55%',
          '--spot-y': '35%',
        } as React.CSSProperties
      }
    >
      {/* Animated mesh base */}
      <div className="home-mesh-gradient absolute inset-0" />

      {/* Mouse spotlight — GPU soft light */}
      {!reduceMotion && (
        <div
          className="absolute inset-0 opacity-70 transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(540px circle at var(--spot-x) var(--spot-y), rgb(0 102 255 / 0.14), transparent 55%)',
          }}
        />
      )}

      {/* Parallax orbs */}
      <motion.div
        className="home-orb home-orb-blue absolute -left-24 top-8 h-72 w-72 rounded-full"
        style={{ y: ySlow, willChange: 'transform' }}
      />
      <motion.div
        className="home-orb home-orb-cyan absolute right-[-4rem] top-24 h-80 w-80 rounded-full"
        style={{ y: yMid, willChange: 'transform' }}
      />
      <motion.div
        className="home-orb home-orb-emerald absolute bottom-[-3rem] left-[28%] h-64 w-64 rounded-full"
        style={{ y: yFast, willChange: 'transform' }}
      />
      <motion.div
        className="home-orb home-orb-indigo absolute right-[18%] bottom-[10%] h-48 w-48 rounded-full opacity-80"
        style={{ y: yMid, willChange: 'transform' }}
      />

      {/* Soft grid fade */}
      <div className="home-grid-fade absolute inset-0 opacity-[0.35] dark:opacity-[0.2]" />
    </div>
  );
}
