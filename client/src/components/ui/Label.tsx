import { cn } from '@/lib/utils';

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('text-sm font-medium text-secondary', className)} {...props}>
      {children}
    </label>
  );
}

export function FormField({
  label,
  children,
  className,
  action,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  /** Optional control aligned on the label row (e.g. AI button) */
  action?: React.ReactNode;
}) {
  return (
    <div className={cn('min-w-0 space-y-1.5', className)}>
      <div className="flex min-h-7 items-center justify-between gap-2">
        <Label className="leading-none">{label}</Label>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
