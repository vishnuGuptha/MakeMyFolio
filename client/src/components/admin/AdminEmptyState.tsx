import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function AdminEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="border-dashed py-10 text-center">
      <p className="font-medium text-primary">{title}</p>
      <p className="mt-1 text-sm text-subtle max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}

export function AdminListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl border border-[#0066FF]/10 bg-elevated/70 p-4 shadow-sm"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-2/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-muted/70" />
            </div>
            <div className="h-8 w-16 shrink-0 animate-pulse rounded-lg bg-muted/80" />
          </div>
        </div>
      ))}
    </div>
  );
}

