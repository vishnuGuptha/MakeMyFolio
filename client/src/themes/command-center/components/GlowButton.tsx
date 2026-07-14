import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  className?: string;
};

export default function GlowButton({
  variant = 'primary',
  children,
  className,
  ...props
}: GlowButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm',
        variant === 'primary' ? 'cc-btn-primary' : 'cc-btn-secondary',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
