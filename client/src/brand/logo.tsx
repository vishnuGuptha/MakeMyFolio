import { cn } from '@/lib/utils';
import { BRAND } from './constants';

type LogoProps = {
  className?: string;
  /** icon | wordmark | full */
  variant?: 'icon' | 'wordmark' | 'full';
  /** Size of the mark in px */
  size?: number;
};

/** MakeMyFolio mark — folio fold, works at 16–64px */
export function BrandMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="8" fill="rgb(var(--brand, 45 212 191))" />
      {/* Folio pages */}
      <path
        d="M8 7.5h12.5c.8 0 1.5.7 1.5 1.5v14c0 .8-.7 1.5-1.5 1.5H8c-.8 0-1.5-.7-1.5-1.5V9c0-.8.7-1.5 1.5-1.5z"
        fill="rgb(10 15 28)"
        opacity="0.35"
      />
      <path
        d="M10 6h13c.8 0 1.5.7 1.5 1.5v16c0 .8-.7 1.5-1.5 1.5H10c-.8 0-1.5-.7-1.5-1.5v-16C8.5 6.7 9.2 6 10 6z"
        fill="rgb(10 15 28)"
      />
      {/* Fold corner */}
      <path d="M23.5 6v5.5c0 .8.7 1.5 1.5 1.5h5.5L23.5 6z" fill="rgb(var(--brand-ink, 15 23 42))" opacity="0.85" />
      <path d="M23.5 6L30.5 13H25c-.8 0-1.5-.7-1.5-1.5V6z" fill="rgb(var(--brand, 45 212 191))" opacity="0.55" />
      {/* Accent bar */}
      <rect x="12" y="12" width="8" height="1.5" rx="0.75" fill="rgb(var(--brand, 45 212 191))" />
      <rect x="12" y="15.5" width="6" height="1.5" rx="0.75" fill="rgb(var(--brand, 45 212 191))" opacity="0.7" />
      <rect x="12" y="19" width="4.5" height="1.5" rx="0.75" fill="rgb(var(--brand, 45 212 191))" opacity="0.45" />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-semibold tracking-tight text-primary', className)}>
      Make<span className="text-accent">My</span>
      <span className="font-bold">Folio</span>
    </span>
  );
}

export function BrandLogo({ className, variant = 'full', size = 28 }: LogoProps) {
  if (variant === 'icon') {
    return <BrandMark size={size} className={className} />;
  }
  if (variant === 'wordmark') {
    return <BrandWordmark className={className} />;
  }
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} aria-label={BRAND.name}>
      <BrandMark size={size} />
      <BrandWordmark />
    </span>
  );
}

export { BRAND } from './constants';
