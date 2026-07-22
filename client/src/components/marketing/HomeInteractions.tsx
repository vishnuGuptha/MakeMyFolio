import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const spring = { stiffness: 320, damping: 28, mass: 0.45 };

/** Magnetic CTA wrapper — subtle follow on hover via translate3d. */
export function MagneticCta({
  children,
  className,
  strength = 10,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={cn('inline-flex will-change-transform', className)}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        x.set((dx / r.width) * strength);
        y.set((dy / r.height) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Glass step card with light 3D tilt on hover. */
export function GlassTiltCard({
  children,
  className,
  tilt = true,
}: {
  children: ReactNode;
  className?: string;
  /** Set false on dense action cards so buttons stay rock-solid to click */
  tilt?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const enabled = tilt && !reduceMotion;
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, spring);
  const sry = useSpring(ry, spring);

  return (
    <motion.div
      ref={ref}
      className={cn('home-glass-card group relative h-full will-change-transform', className)}
      style={
        enabled
          ? {
              rotateX: srx,
              rotateY: sry,
              transformPerspective: 900,
            }
          : undefined
      }
      onPointerMove={(e) => {
        if (!enabled) return;
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * 8);
        rx.set((0.5 - py) * 8);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      animate={enabled ? { y: [0, -3, 0] } : undefined}
      whileHover={enabled ? { y: -8, scale: 1.015 } : undefined}
      transition={
        enabled
          ? {
              y: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' },
              scale: { type: 'spring', stiffness: 300, damping: 24 },
            }
          : undefined
      }
    >
      <div className="home-glass-card-shine pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {children}
    </motion.div>
  );
}
