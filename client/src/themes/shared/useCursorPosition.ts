import { useEffect, useRef, useState } from 'react';
import type { CursorEffectId } from './cursorEffects';

export interface CursorPosition {
  x: number;
  y: number;
  intensity: number;
}

export function useCursorPosition(effect: CursorEffectId) {
  const enabled = effect !== 'none';
  const [position, setPosition] = useState<CursorPosition>({ x: -500, y: -500, intensity: 1 });
  const target = useRef({ x: -500, y: -500, intensity: 1 });
  const current = useRef({ x: -500, y: -500, intensity: 1 });
  const visible = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (prefersReduced || !finePointer) return;

    const onMove = (e: MouseEvent) => {
      const interactive =
        effect === 'hover-spotlight' &&
        Boolean(
          document
            .elementFromPoint(e.clientX, e.clientY)
            ?.closest('a, button, input, textarea, select, label, [role="button"]')
        );

      target.current = {
        x: e.clientX,
        y: e.clientY,
        intensity: interactive ? 1.55 : 1,
      };

      if (!visible.current) {
        visible.current = true;
        current.current = { ...target.current };
      }
    };

    const onLeave = () => {
      visible.current = false;
    };

    let frame = 0;
    const tick = () => {
      if (visible.current) {
        const ease = effect === 'follower' ? 0.18 : 0.14;
        current.current.x += (target.current.x - current.current.x) * ease;
        current.current.y += (target.current.y - current.current.y) * ease;
        current.current.intensity += (target.current.intensity - current.current.intensity) * 0.2;
        setPosition({ ...current.current });
        document.documentElement.style.setProperty('--cursor-x', `${current.current.x}px`);
        document.documentElement.style.setProperty('--cursor-y', `${current.current.y}px`);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(frame);
      document.documentElement.style.removeProperty('--cursor-x');
      document.documentElement.style.removeProperty('--cursor-y');
    };
  }, [enabled, effect]);

  return position;
}
