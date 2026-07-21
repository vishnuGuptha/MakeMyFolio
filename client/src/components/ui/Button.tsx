import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { InlineSpinner } from '@/components/ui/PageLoader';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent text-white hover:bg-accent-hover',
        outline:
          'border border-border/90 text-primary bg-elevated/50 hover:bg-muted hover:border-[#0066FF]/35',
        ghost: 'text-secondary hover:bg-muted hover:text-primary',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 min-h-8 px-2.5 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
        iconSm: 'h-8 w-8 shrink-0 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a compact spinner and disables the control (ignored with asChild) */
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, children, disabled, ...props },
    ref
  ) => {
    const classes = cn(buttonVariants({ variant, size, className }));

    // Slot requires exactly one element child — never inject siblings.
    if (asChild) {
      return (
        <Slot className={classes} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={classes}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <InlineSpinner
            className={
              variant === 'outline' || variant === 'ghost'
                ? 'border-[#0066FF]/35 border-t-[#0066FF]'
                : undefined
            }
          />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
