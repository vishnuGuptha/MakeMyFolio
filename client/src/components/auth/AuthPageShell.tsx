import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { BrandLogo, BrandMark } from '@/brand/logo';
import { BRAND } from '@/brand/constants';
import { getPortfolioUrlPlaceholder } from '@/lib/domains';
import { AppThemeToggle } from '@/components/ui/AppThemeToggle';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type AuthPageShellProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  meshClassName?: string;
  eyebrow?: string;
  panelTitle?: string;
  panelBody?: string;
  highlights?: string[];
};

const DEFAULT_HIGHLIGHTS = [
  'Open playground — no card required',
  `Publish at ${getPortfolioUrlPlaceholder()}`,
  'Import a resume when ready',
];

/**
 * Stable split auth layout — fits viewport with no page scroll.
 */
export function AuthPageShell({
  children,
  footer,
  className,
  meshClassName,
  eyebrow = 'Welcome',
  panelTitle = `Build a live portfolio on ${BRAND.name}`,
  panelBody = BRAND.tagline,
  highlights = DEFAULT_HIGHLIGHTS,
}: AuthPageShellProps) {
  useEffect(() => {
    document.documentElement.classList.add('marketing-hide-scrollbar');
    document.documentElement.classList.add('marketing-shell');
    return () => {
      document.documentElement.classList.remove('marketing-hide-scrollbar');
      document.documentElement.classList.remove('marketing-shell');
    };
  }, []);

  return (
    <div
      className={cn(
        'marketing-shell relative flex h-dvh flex-col overflow-hidden bg-base text-primary',
        meshClassName
      )}
    >
      {/* Static atmosphere — no motion */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 opacity-100 dark:opacity-70"
          style={{
            background:
              'radial-gradient(ellipse 75% 60% at 12% 15%, rgb(0 102 255 / 0.22), transparent 52%), radial-gradient(ellipse 55% 50% at 90% 75%, rgb(99 102 241 / 0.16), transparent 50%), radial-gradient(ellipse 40% 35% at 50% 100%, rgb(6 182 212 / 0.12), transparent 55%)',
          }}
        />
        <div className="absolute -left-16 top-[12%] h-56 w-56 rounded-full bg-[#0066FF]/30 blur-3xl dark:bg-[#0066FF]/20" />
        <div className="absolute -right-12 bottom-[18%] h-48 w-48 rounded-full bg-cyan-400/25 blur-3xl dark:bg-cyan-400/15" />
        <div className="absolute left-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-400/10" />
      </div>

      <header className="relative z-20 shrink-0 border-b border-border/50 bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            to="/"
            className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <BrandLogo size={24} />
          </Link>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="ghost" asChild className="hidden h-8 sm:inline-flex">
              <Link to="/">Home</Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="h-8">
              <Link to="/try">Open playground</Link>
            </Button>
            <AppThemeToggle />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto grid h-full w-full max-w-5xl lg:grid-cols-2">
          {/* Brand panel */}
          <section className="relative hidden flex-col justify-center px-8 lg:flex xl:px-12">
            <div className="relative max-w-sm">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
                {eyebrow}
              </p>
              <div className="mb-4 inline-flex rounded-xl border border-[#0066FF]/15 bg-white/80 p-2.5 shadow-[0_8px_24px_-12px_rgb(0_70_180/0.35)] backdrop-blur-sm dark:border-border/70 dark:bg-elevated/60 dark:shadow-sm">
                <BrandMark size={40} />
              </div>
              <h1 className="font-display text-[1.85rem] leading-tight text-primary xl:text-[2.1rem]">
                {panelTitle}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-secondary">{panelBody}</p>
              <ul className="mt-6 space-y-2.5">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-secondary">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0066FF]/12 text-[#0066FF]">
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Form — centered, no scroll */}
          <section className="relative flex h-full items-center justify-center overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
            <div
              className="pointer-events-none absolute inset-y-6 left-0 hidden w-px bg-gradient-to-b from-transparent via-border to-transparent lg:block"
              aria-hidden
            />
            <div className={cn('w-full max-w-[380px]', className)}>
              <div className="mb-3 lg:hidden">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
                  {eyebrow}
                </p>
              </div>

              <div className="marketing-auth-card rounded-2xl border border-border/80 bg-elevated/90 p-4 shadow-[0_16px_40px_-24px_rgb(15_23_42/0.35)] backdrop-blur-md sm:p-5 dark:border-white/10 dark:bg-elevated/70 dark:shadow-[0_16px_40px_-24px_rgb(0_0_0/0.55)]">
                {children}
              </div>
              {footer}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
