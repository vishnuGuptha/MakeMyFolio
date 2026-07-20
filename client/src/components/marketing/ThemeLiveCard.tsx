import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { PortfolioThemeId } from '@/themes/types';

/** Static preview card — SVG screenshots (no live iframes; keeps marketing scroll smooth). */
export function ThemeLiveCard({
  themeId,
  name,
  description,
  demoLabel,
  className,
  href,
}: {
  themeId: PortfolioThemeId;
  name: string;
  description: string;
  /** e.g. demo person name from try-demo seed */
  demoLabel?: string;
  className?: string;
  href?: string;
}) {
  const to = href ?? `/try?theme=${themeId}`;

  return (
    <Link
      to={to}
      className={cn(
        'group block overflow-hidden rounded-xl border border-border bg-base transition-transform hover:-translate-y-0.5 hover:border-accent/40',
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-elevated [contain:paint]">
        <img
          src={`/theme-previews/${themeId}.svg`}
          alt={`${name} theme preview`}
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-base/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <span className="absolute bottom-2.5 right-2.5 rounded-md bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          Try this
        </span>
      </div>
      <div className="border-t border-border px-3 py-2.5">
        <p className="text-sm font-medium text-primary">{name}</p>
        {demoLabel && (
          <p className="mt-0.5 text-[11px] text-accent/90">Demo · {demoLabel}</p>
        )}
        <p className="mt-0.5 text-xs text-subtle line-clamp-2">{description}</p>
      </div>
    </Link>
  );
}

/** Compact static frame for hero mock window */
export function ThemeLiveHeroFrame({
  themeId = 'studio',
  className,
}: {
  themeId?: PortfolioThemeId;
  className?: string;
}) {
  return (
    <div className={cn('relative aspect-[16/11] overflow-hidden rounded-lg bg-base [contain:paint]', className)}>
      <img
        src={`/theme-previews/${themeId}.svg`}
        alt="Theme demo preview"
        width={640}
        height={440}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover object-top"
      />
    </div>
  );
}
