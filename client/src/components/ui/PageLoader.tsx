import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { BrandMark } from '@/brand/logo';
import { BRAND } from '@/brand/constants';

type LoaderVariant = 'page' | 'inline' | 'overlay';

type PageLoaderProps = {
  /** Short status copy — kept calm and optional */
  label?: string;
  variant?: LoaderVariant;
  className?: string;
  /** Delay before showing (avoids flash on fast loads). Default 120ms. */
  delayMs?: number;
  /** Force visible immediately (e.g. Suspense fallbacks that already waited) */
  immediate?: boolean;
};

/**
 * Branded loading state — delayed reveal, reduced-motion safe, accessible.
 */
export function PageLoader({
  label,
  variant = 'page',
  className,
  delayMs = 120,
  immediate = false,
}: PageLoaderProps) {
  const [visible, setVisible] = useState(immediate || delayMs <= 0);

  useEffect(() => {
    if (immediate || delayMs <= 0) {
      setVisible(true);
      return;
    }
    const t = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs, immediate]);

  if (!visible) {
    return (
      <div
        className={cn(
          variant === 'page' && 'min-h-svh',
          variant === 'overlay' && 'absolute inset-0',
          variant === 'inline' && 'min-h-[8rem]',
          className
        )}
        aria-hidden
      />
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'bmf-loader flex flex-col items-center justify-center gap-4',
        variant === 'page' && 'bmf-loader-page min-h-svh w-full px-6',
        variant === 'inline' && 'bmf-loader-inline min-h-[10rem] w-full py-10',
        variant === 'overlay' &&
          'bmf-loader-overlay absolute inset-0 z-20 bg-[rgb(var(--bg-base)/0.72)] backdrop-blur-[6px]',
        className
      )}
    >
      <div className="bmf-loader-mark relative flex h-14 w-14 items-center justify-center">
        <span className="bmf-loader-ring" aria-hidden />
        <span className="bmf-loader-ring bmf-loader-ring-delay" aria-hidden />
        <BrandMark size={28} className="relative z-10" />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium tracking-tight text-primary">
          {label || `Loading ${BRAND.name}`}
        </p>
        <div className="bmf-loader-bar" aria-hidden>
          <span className="bmf-loader-bar-fill" />
        </div>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}

/** Tiny spinner for buttons / dense UI */
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn('bmf-inline-spinner inline-block h-3.5 w-3.5 shrink-0', className)}
      aria-hidden
    />
  );
}
