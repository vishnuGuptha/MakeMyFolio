import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-muted', className)} />;
}

export function PortfolioSkeleton() {
  return (
    <div className="min-h-screen gradient-mesh">
      <div className="mx-auto max-w-5xl px-6 py-20 space-y-16">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
