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
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}
