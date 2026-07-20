import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { publicApi } from '@/api';
import { BRAND } from '@/brand/constants';
import { createDemoGuestDraft, type GuestDraft } from '@/context/GuestDraftContext';
import { PORTFOLIO_THEME_LIST } from '@/themes/registry';
import { ThemeLiveCard } from '@/components/marketing/ThemeLiveCard';
import { MagneticCta } from '@/components/marketing/HomeInteractions';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Themes gallery — every registered theme with the shared try-demo content.
 */
export default function ThemesPage() {
  const reduceMotion = useReducedMotion();
  const [demo, setDemo] = useState<GuestDraft>(() => createDemoGuestDraft());

  useEffect(() => {
    let cancelled = false;
    void publicApi
      .getTryDemo()
      .then((seed) => {
        if (!cancelled && seed) setDemo(seed);
      })
      .catch(() => {
        /* keep local demo seed */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const demoName = demo.content?.name?.trim() || 'Demo folio';

  return (
    <main className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 55% 40% at 10% 0%, rgb(0 102 255 / 0.12), transparent 55%), radial-gradient(ellipse 40% 35% at 90% 10%, rgb(99 102 241 / 0.1), transparent 50%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <motion.div
          className="flex flex-wrap items-end justify-between gap-5"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="max-w-xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
              Themes
            </p>
            <h1 className="font-display text-4xl text-primary sm:text-5xl">
              Pick a look, then make it yours
            </h1>
            <p className="mt-3 text-base text-subtle sm:text-lg">
              Every look on {BRAND.name}, previewed with the same demo ({demoName}). Open any theme
              in the try editor — no account needed.
            </p>
          </div>
          <MagneticCta>
            <Button asChild className={cn('home-cta-primary h-11 border-0 px-5 hover:bg-transparent')}>
              <Link to="/try">
                Open try editor <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </MagneticCta>
        </motion.div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PORTFOLIO_THEME_LIST.map((theme, i) => (
            <motion.div
              key={theme.id}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.04, ease }}
            >
              <ThemeLiveCard
                themeId={theme.id}
                name={theme.name}
                description={theme.description}
                demoLabel={demoName}
                href={`/try?theme=${theme.id}`}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="home-glass-card mt-14 text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease }}
        >
          <h2 className="font-display text-2xl text-primary sm:text-3xl">Like what you see?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-subtle sm:text-base">
            Jump into try mode, switch themes live, then create a free account when you&apos;re ready
            to publish.
          </p>
          <MagneticCta className="mt-5">
            <Button asChild className={cn('home-cta-primary h-11 border-0 px-5 hover:bg-transparent')}>
              <Link to="/try">
                Try free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </MagneticCta>
        </motion.div>
      </div>
    </main>
  );
}
