import { cn } from '@/lib/utils';
import { PageLoader } from '@/components/ui/PageLoader';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bmf-skeleton rounded-lg', className)} />;
}

export function PortfolioSkeleton() {
  return <PageLoader variant="page" label="Loading portfolio" immediate />;
}
