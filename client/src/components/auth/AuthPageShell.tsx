import { Link } from 'react-router-dom';
import { BrandLogo } from '@/brand/logo';
import { AppThemeToggle } from '@/components/ui/AppThemeToggle';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

type AuthPageShellProps = {
  children: React.ReactNode;
  /** Extra footer under the card (e.g. sign-in link) */
  footer?: React.ReactNode;
  className?: string;
  meshClassName?: string;
};

/**
 * Centered auth layout that stays scrollable when the form is taller than the viewport,
 * with clear navigation back to marketing home and try mode.
 */
export function AuthPageShell({
  children,
  footer,
  className,
  meshClassName = 'marketing-mesh',
}: AuthPageShellProps) {
  return (
    <div
      className={cn(
        'relative min-h-dvh overflow-y-auto',
        meshClassName
      )}
    >
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/40 bg-elevated/80 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Link to="/" className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <BrandLogo size={24} className="text-sm" />
          </Link>
          <nav className="flex items-center gap-3 text-xs sm:text-sm">
            <Link to="/" className="text-subtle hover:text-accent transition-colors">
              Home
            </Link>
            <Link to="/try" className="text-subtle hover:text-accent transition-colors">
              Try editor
            </Link>
          </nav>
        </div>
        <AppThemeToggle />
      </header>

      <div className="flex justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className={cn('my-auto w-full max-w-md', className)}>
          <Card className="glass-panel">{children}</Card>
          {footer}
        </div>
      </div>
    </div>
  );
}
