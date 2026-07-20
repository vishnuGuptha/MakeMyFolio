import { cn } from '@/lib/utils';

/** Initials from a display name — e.g. "Vishnu Gupta" → "VG" */
export function getNameInitials(name: string, max = 2): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, max).toUpperCase();
  return parts
    .slice(0, max)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

type PortfolioNavAvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
  /** Extra classes for the initials fallback */
  fallbackClassName?: string;
};

/**
 * Top-of-portfolio identity mark: uploaded photo, or name initials.
 */
export function PortfolioNavAvatar({
  name,
  imageUrl,
  size = 32,
  className,
  fallbackClassName,
}: PortfolioNavAvatarProps) {
  const initials = getNameInitials(name);
  const dim = { width: size, height: size, minWidth: size, minHeight: size };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        style={dim}
        className={cn('rounded-full object-cover shrink-0 ring-2 ring-accent/40', className)}
      />
    );
  }

  return (
    <span
      style={dim}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent font-semibold ring-2 ring-accent/30',
        fallbackClassName,
        className
      )}
      aria-hidden
    >
      <span style={{ fontSize: Math.max(10, Math.round(size * 0.36)) }}>{initials}</span>
    </span>
  );
}
