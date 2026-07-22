import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { InlineSpinner } from '@/components/ui/PageLoader';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[colors,transform,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-[0.985] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100',
  {
    variants: {
      variant: {
        default:
          'bg-accent text-white shadow-[0_10px_24px_-12px_rgb(0_102_255/0.55)] hover:bg-accent-hover hover:shadow-[0_14px_28px_-10px_rgb(0_102_255/0.65)]',
        outline:
          'border border-border/90 text-primary bg-elevated/50 hover:bg-muted hover:border-[#0066FF]/35 hover:text-[#0066FF]',
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
