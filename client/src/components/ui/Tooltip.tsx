import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

export function TooltipProvider({
  children,
  delayDuration = 280,
  skipDelayDuration = 120,
}: {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export function TooltipRoot({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>;
}

export function TooltipTrigger({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>) {
  return (
    <TooltipPrimitive.Trigger asChild {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  );
}

export function TooltipContent({
  className,
  sideOffset = 8,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn('bmf-tooltip', className)}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bmf-tooltip-arrow" width={11} height={6} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

type TooltipProps = {
  children: React.ReactElement;
  content?: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
  /** When false, renders children only (no tooltip). */
  enabled?: boolean;
};

/** One-liner tooltip — wraps a single element that can hold a ref. */
export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration,
  className,
  enabled = true,
}: TooltipProps) {
  if (!enabled || content == null || content === false || content === '') {
    return children;
  }

  return (
    <TooltipRoot delayDuration={delayDuration}>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align} className={className}>
        {content}
      </TooltipContent>
    </TooltipRoot>
  );
}
