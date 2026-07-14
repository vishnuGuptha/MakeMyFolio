import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { PortfolioThemeId } from '@/themes/types';

/** Live scaled iframe of real theme UI (demo data) for marketing theme cards. */
export function ThemeLiveCard({
  themeId,
  name,
  description,
  className,
  href = '/try',
}: {
  themeId: PortfolioThemeId;
  name: string;
  description: string;
  className?: string;
  href?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: '120px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Link
      to={href}
      className={cn(
        'group block overflow-hidden rounded-xl border border-border bg-base transition-transform hover:-translate-y-0.5',
        className
      )}
    >
      <div ref={rootRef} className="relative aspect-[16/10] overflow-hidden bg-elevated">
        {active ? (
          <iframe
            title={`${name} theme preview`}
            src={`/theme-demo/${themeId}`}
            loading="lazy"
            tabIndex={-1}
            className="pointer-events-none absolute left-0 top-0 border-0"
            style={{
              width: '360%',
              height: '360%',
              transform: 'scale(0.278)',
              transformOrigin: 'top left',
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-subtle">
            Loading {name}…
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="border-t border-border px-3 py-2.5">
        <p className="text-sm font-medium text-primary">{name}</p>
        <p className="text-xs text-subtle line-clamp-1">{description}</p>
      </div>
    </Link>
  );
}

/** Compact live frame for hero mock window */
export function ThemeLiveHeroFrame({
  themeId = 'studio',
  className,
}: {
  themeId?: PortfolioThemeId;
  className?: string;
}) {
  return (
    <div className={cn('relative aspect-[16/11] overflow-hidden rounded-lg bg-base', className)}>
      <iframe
        title="Theme demo preview"
        src={`/theme-demo/${themeId}`}
        loading="lazy"
        tabIndex={-1}
        className="pointer-events-none absolute left-0 top-0 border-0"
        style={{
          width: '320%',
          height: '320%',
          transform: 'scale(0.3125)',
          transformOrigin: 'top left',
        }}
      />
    </div>
  );
}
