import { cn } from '@/lib/utils';
import { BRAND } from './constants';

type LogoProps = {
  className?: string;
  /** icon | wordmark | full */
  variant?: 'icon' | 'wordmark' | 'full';
  /** Icon height in px (full logo uses this for the mark) */
  size?: number;
};

const ICON_SRC = '/brand/logo-icon.png';

/** BuildMyFolio mark — transparent PNG growth icon */
export function BrandMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <img
      src={ICON_SRC}
      alt=""
      width={size}
      height={size}
      className={cn('shrink-0 object-contain', className)}
      aria-hidden
      decoding="async"
    />
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('font-semibold tracking-tight', className)}>
      <span className="text-[#00153D] dark:text-primary">BuildMy</span>
      <span className="font-bold text-[#0066FF]">Folio</span>
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
    <span
      className={cn('inline-flex items-center gap-2', className)}
      aria-label={BRAND.name}
    >
      <BrandMark size={size} />
      <BrandWordmark className="text-[0.95em] leading-none" />
    </span>
  );
}

export { BRAND } from './constants';
