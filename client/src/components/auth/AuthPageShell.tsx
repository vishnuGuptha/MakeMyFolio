import { Link } from 'react-router-dom';
import { BrandLogo } from '@/brand/logo';
import { AppThemeToggle } from '@/components/ui/AppThemeToggle';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type AuthPageShellProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  meshClassName?: string;
};

/**
 * Standard SaaS auth layout: fixed viewport, centered card, scroll only if the form overflows.
 * Uses my-auto (not items-center) so tall forms scroll from the top without clipping the heading.
 */
export function AuthPageShell({
  children,
  footer,
  className,
  meshClassName = 'marketing-mesh',
}: AuthPageShellProps) {
  return (
    <div className={cn('flex h-dvh flex-col overflow-hidden', meshClassName)}>
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border/50 bg-elevated/80 px-4 backdrop-blur-md sm:px-6">
        <Link
          to="/"
          className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <BrandLogo size={22} className="text-sm" />
        </Link>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" asChild>
            <Link to="/">Home</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/try">Try</Link>
          </Button>
          <AppThemeToggle />
        </div>
      </header>

      <main className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 py-4 sm:px-6">
        <div className={cn('my-auto w-full max-w-md', className)}>
          <Card className="glass-panel p-4 sm:p-5">{children}</Card>
          {footer}
        </div>
      </main>
    </div>
  );
}
