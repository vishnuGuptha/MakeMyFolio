import { useEffect, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { cn } from '@/lib/utils';

function useLayerOffset(
  scrollY: MotionValue<number>,
  mouseX: MotionValue<number>,
  mouseY: MotionValue<number>,
  mouseScale: number,
  reduce: boolean | null,
) {
  const x = useTransform(mouseX, (v) => (reduce ? 0 : v * mouseScale));
  const y = useTransform(
    [scrollY, mouseY],
    ([sy, my]) => (reduce ? 0 : (sy as number) + (my as number) * mouseScale * 0.75),
  );
  return { x, y };
}

/** CSS-only mini portfolio card — decorative, no iframe. */
function FloatCard({
  className,
  title,
  accent,
  delay = 0,
}: {
  className?: string;
  title: string;
  accent: string;
  delay?: number;
}) {
  return (
    <div
      className={cn('home-float-card', className)}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-center gap-1.5 border-b border-white/20 px-2.5 py-1.5 dark:border-white/10">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400/80" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
        <span className="ml-1 truncate font-mono text-[8px] text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
      </div>
      <div className="space-y-1.5 p-2.5">
        <div className="h-2 w-10 rounded-full" style={{ background: accent, opacity: 0.85 }} />
        <div className="h-1.5 w-[85%] rounded-full bg-zinc-300/80 dark:bg-zinc-600/80" />
        <div className="h-1.5 w-[60%] rounded-full bg-zinc-200/80 dark:bg-zinc-700/70" />
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <div className="h-8 rounded-md bg-gradient-to-br from-white/50 to-zinc-200/40 dark:from-white/10 dark:to-zinc-800/50" />
          <div className="h-8 rounded-md bg-gradient-to-br from-white/40 to-zinc-300/30 dark:from-white/5 dark:to-zinc-800/40" />
        </div>
      </div>
    </div>
  );
}

type LayerProps = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  className?: string;
  children: React.ReactNode;
};

function ParallaxLayer({ x, y, className, children }: LayerProps) {
  return (
    <motion.div
      className={cn('absolute inset-0 will-change-transform', className)}
      style={{ x, y }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Page-wide living atmosphere: 6 GPU parallax layers, floating geometry,
 * glass panels, mini cards, soft particles. No Three.js.
 */
export function HomeLivingScene({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start start', 'end end'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 70, damping: 28, mass: 0.35 });

  const s1 = useTransform(smooth, [0, 1], [0, 50]);
  const s2 = useTransform(smooth, [0, 1], [0, 120]);
  const s3 = useTransform(smooth, [0, 1], [0, 200]);
  const s4 = useTransform(smooth, [0, 1], [0, 300]);
  const s5 = useTransform(smooth, [0, 1], [0, 400]);
  const s6 = useTransform(smooth, [0, 1], [0, 500]);

  const mouseX = useSpring(0, { stiffness: 55, damping: 20, mass: 0.4 });
  const mouseY = useSpring(0, { stiffness: 55, damping: 20, mass: 0.4 });

  const l1 = useLayerOffset(s1, mouseX, mouseY, 0.15, reduceMotion);
  const l2 = useLayerOffset(s2, mouseX, mouseY, 0.4, reduceMotion);
  const l3 = useLayerOffset(s3, mouseX, mouseY, 0.75, reduceMotion);
  const l4 = useLayerOffset(s4, mouseX, mouseY, 1.15, reduceMotion);
  const l5 = useLayerOffset(s5, mouseX, mouseY, 1.55, reduceMotion);
  const l6 = useLayerOffset(s6, mouseX, mouseY, 2, reduceMotion);

  useEffect(() => {
    if (reduceMotion) return;
    const el = rootRef.current;
    if (!el) return;

    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / Math.max(rect.width, 1);
      const ny = (e.clientY - rect.top) / Math.max(rect.height, 1);
      tx = (nx - 0.5) * 32;
      ty = (ny - 0.5) * 20;
      el.style.setProperty('--spot-x', `${nx * 100}%`);
      el.style.setProperty('--spot-y', `${ny * 100}%`);
    };

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      mouseX.set(cx);
      mouseY.set(cy);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion, mouseX, mouseY]);

  return (
    <div
      ref={rootRef}
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden
      style={
        {
          '--spot-x': '55%',
          '--spot-y': '28%',
        } as React.CSSProperties
      }
    >
      {/* L1 — mesh */}
      <ParallaxLayer x={l1.x} y={l1.y}>
        <div className="home-mesh-gradient absolute inset-0" />
        <div className="home-mesh-secondary absolute inset-0" />
      </ParallaxLayer>

      {/* L2 — orbs */}
      <ParallaxLayer x={l2.x} y={l2.y}>
        <div className="home-orb home-orb-blue home-orb-drift absolute -left-20 top-[8%] h-80 w-80 rounded-full" />
        <div className="home-orb home-orb-cyan home-orb-drift-alt absolute right-[-5rem] top-[12%] h-[22rem] w-[22rem] rounded-full" />
        <div className="home-orb home-orb-emerald home-orb-drift absolute bottom-[28%] left-[22%] h-72 w-72 rounded-full" />
        <div className="home-orb home-orb-indigo home-orb-drift-alt absolute right-[12%] top-[42%] h-56 w-56 rounded-full opacity-90" />
        <div
          className="home-orb home-orb-blue home-orb-drift absolute left-[55%] top-[70%] h-48 w-48 rounded-full opacity-70"
          style={{ animationDelay: '-4s' }}
        />
      </ParallaxLayer>

      {/* L3 — glass + rings (right / product side only) */}
      <ParallaxLayer x={l3.x} y={l3.y} className="hidden sm:block">
        <div className="home-float-slow absolute right-[4%] top-[14%]">
          <div className="home-glass-slab h-28 w-40 -rotate-12" />
        </div>
        <div className="home-float-med absolute right-[10%] top-[58%]">
          <div className="home-glass-slab h-24 w-36 rotate-[8deg]" />
        </div>
        <div className="absolute right-[38%] top-[6%]">
          <div className="home-ring home-spin-slow h-36 w-36" />
        </div>
        <div className="absolute right-[18%] top-[28%] opacity-80">
          <div className="home-ring home-ring-cyan home-spin-rev h-28 w-28" />
        </div>
        <div className="absolute right-[28%] top-[72%] opacity-70">
          <div className="home-ring home-ring-emerald home-spin-slow h-24 w-24" />
        </div>
      </ParallaxLayer>

      {/* L4 — float cards (right / behind devices only — never under copy) */}
      <ParallaxLayer x={l4.x} y={l4.y} className="hidden md:block">
        <div className="absolute right-[2%] top-[22%] rotate-[7deg]">
          <FloatCard className="relative w-[9.5rem]" title="you.buildmyfolio.com" accent="#0066FF" delay={0} />
        </div>
        <div className="absolute right-[8%] top-[48%] -rotate-6">
          <FloatCard className="relative w-[8.5rem]" title="studio · live" accent="#06b6d4" delay={1.2} />
        </div>
        <div className="absolute right-[14%] top-[78%] rotate-[4deg] opacity-85">
          <FloatCard className="relative w-[8rem]" title="import · resume" accent="#10b981" delay={2.1} />
        </div>
      </ParallaxLayer>

      {/* L5 — geometry (product side) */}
      <ParallaxLayer x={l5.x} y={l5.y} className="hidden sm:block">
        <div className="home-float-med absolute right-[6%] top-[36%]">
          <div className="home-cube h-14 w-14" />
        </div>
        <div className="home-float-slow absolute right-[22%] top-[68%]">
          <div className="home-sphere h-16 w-16" />
        </div>
        <div className="home-float-fast absolute right-[32%] top-[10%]">
          <div className="home-cube home-cube-cyan h-10 w-10" />
        </div>
        <div className="home-float-med absolute right-[40%] top-[82%]">
          <div className="home-prism h-12 w-12" />
        </div>
      </ParallaxLayer>

      {/* L6 — particles + light */}
      <ParallaxLayer x={l6.x} y={l6.y}>
        {!reduceMotion && (
          <>
            <div className="home-particle absolute left-[18%] top-[20%]" style={{ animationDelay: '0s' }} />
            <div className="home-particle absolute left-[72%] top-[18%]" style={{ animationDelay: '1.4s' }} />
            <div
              className="home-particle home-particle-cyan absolute left-[48%] top-[35%]"
              style={{ animationDelay: '0.6s' }}
            />
            <div className="home-particle absolute left-[85%] top-[48%]" style={{ animationDelay: '2.2s' }} />
            <div
              className="home-particle home-particle-emerald absolute left-[28%] top-[62%]"
              style={{ animationDelay: '1.8s' }}
            />
            <div className="home-particle absolute left-[62%] top-[78%]" style={{ animationDelay: '0.9s' }} />
            <div
              className="home-particle home-particle-cyan absolute left-[10%] top-[88%]"
              style={{ animationDelay: '2.8s' }}
            />
            <div className="home-particle absolute left-[40%] top-[12%]" style={{ animationDelay: '3.2s' }} />
          </>
        )}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(560px circle at var(--spot-x) var(--spot-y), rgb(0 102 255 / 0.18), transparent 55%)',
          }}
        />
        <div className="home-grid-fade absolute inset-0 opacity-[0.35] dark:opacity-[0.18]" />
      </ParallaxLayer>

      <div className="home-scene-vignette absolute inset-0" />
    </div>
  );
}
