import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { User } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingAvatarProps {
  imageUrl?: string;
  name: string;
  className?: string;
}

const avatarSize =
  'h-48 w-48 sm:h-56 sm:w-56 md:h-60 md:w-60 lg:h-64 lg:w-64 xl:h-72 xl:w-72 max-w-[min(100%,18rem)]';

export default function FloatingAvatar({ imageUrl, name, className }: FloatingAvatarProps) {
  const reduceMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 50, y: 35 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine) return;

    const onMove = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const reach = Math.max(r.width, r.height) * 1.35;
      if (dist > reach) {
        setActive(false);
        return;
      }
      setActive(true);
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      setSpot({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduceMotion]);

  return (
    <div ref={wrapRef} className={cn('spotlight-avatar-float shrink-0 relative', className)}>
      <div className="spotlight-avatar-ring relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className={cn(avatarSize, 'rounded-full object-cover aspect-square')}
          />
        ) : (
          <div
            className={cn(
              avatarSize,
              'rounded-full bg-muted/30 flex items-center justify-center aspect-square'
            )}
          >
            <User className="h-16 w-16 sm:h-20 sm:w-20 text-subtle" />
          </div>
        )}
        {!reduceMotion ? (
          <div
            className={cn('spotlight-cursor-beam', active && 'is-active')}
            style={
              {
                '--spot-x': `${spot.x}%`,
                '--spot-y': `${spot.y}%`,
              } as CSSProperties
            }
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}
