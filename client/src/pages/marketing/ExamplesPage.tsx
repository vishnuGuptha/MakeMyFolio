import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { publicApi } from '@/api';
import { BRAND } from '@/brand/constants';
import { EXAMPLE_FOLIOS } from '@/lib/exampleFolios';
import { getPublicPortfolioUrl } from '@/lib/utils';
import { getPortfolioTheme } from '@/themes/registry';
import { MagneticCta } from '@/components/marketing/HomeInteractions';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { PublicExampleFolio } from '@/types';

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Public examples — opt-in live folios, plus curated starter templates.
 */
export default function ExamplesPage() {
  const reduceMotion = useReducedMotion();
  const [live, setLive] = useState<PublicExampleFolio[] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    publicApi
      .getExamples()
      .then((res) => {
        if (!cancelled) setLive(res.examples || []);
      })
      .catch(() => {
        if (!cancelled) {
          setLive([]);
          setLoadError(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const liveCount = live?.length ?? 0;

  return (
    <main className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 10% 0%, rgb(0 102 255 / 0.18), transparent 55%), radial-gradient(ellipse 45% 40% at 90% 10%, rgb(99 102 241 / 0.12), transparent 50%)',
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
              Examples
            </p>
            <h1 className="font-display text-4xl text-primary sm:text-5xl">
              Real folios from {BRAND.name}
            </h1>
            <p className="mt-3 text-base text-subtle sm:text-lg">
              Browse live portfolios people opted to share. Open any one, or remix the same theme in
              the playground.
            </p>
          </div>
          <MagneticCta>
            <Button asChild className={cn('home-cta-primary h-11 border-0 px-5 hover:bg-transparent')}>
              <Link to="/try">
                Open playground <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </MagneticCta>
        </motion.div>

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-primary">Live examples</h2>
            {live !== null ? (
              <p className="text-xs text-subtle">
                {liveCount === 0
                  ? 'None listed yet — starter templates below'
                  : `${liveCount} opt-in folio${liveCount === 1 ? '' : 's'}`}
              </p>
            ) : null}
          </div>

          {live === null ? (
            <p className="text-sm text-subtle">Loading examples…</p>
          ) : loadError ? (
            <p className="text-sm text-subtle">Couldn’t load live examples right now.</p>
          ) : liveCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#0066FF]/20 bg-elevated/50 px-5 py-8 text-center">
              <p className="text-sm text-secondary">
                No public folios yet. Publish yours and turn on{' '}
                <span className="font-medium text-primary">Show in Examples gallery</span> in
                Settings.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-4 h-9">
                <Link to="/dashboard/settings">Open settings</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((ex, i) => {
                const theme = getPortfolioTheme(ex.themeId);
                const liveUrl = getPublicPortfolioUrl(ex.slug);
                return (
                  <motion.article
                    key={ex.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: i * 0.04, ease }}
                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#0066FF]/12 bg-elevated/80 backdrop-blur-sm"
                  >
                    <div className="relative aspect-[16/10] bg-muted">
                      <img
                        src={`/theme-previews/${theme.id}.svg`}
                        alt=""
                        className="h-full w-full object-cover object-top"
                      />
                      {ex.profileImageUrl ? (
                        <img
                          src={ex.profileImageUrl}
                          alt=""
                          className="absolute bottom-3 left-3 h-11 w-11 rounded-full border-2 border-elevated object-cover shadow-sm"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#0066FF]/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0066FF]">
                          Live
                        </span>
                        <span className="text-[11px] text-subtle">{theme.name}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-primary">{ex.name}</h3>
                      {ex.title ? (
                        <p className="mt-0.5 text-sm font-medium text-secondary">{ex.title}</p>
                      ) : null}
                      {ex.tagline ? (
                        <p className="mt-2 line-clamp-2 text-sm text-subtle">{ex.tagline}</p>
                      ) : null}
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button
                          asChild
                          size="sm"
                          className="home-cta-primary h-9 border-0 px-4 shadow-none"
                        >
                          <a href={liveUrl} target="_blank" rel="noopener noreferrer">
                            View live <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="home-cta-secondary h-9">
                          <Link to={`/try?theme=${theme.id}`}>Try this theme</Link>
                        </Button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-14">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">Starter templates</h2>
            <p className="mt-1 text-sm text-subtle">
              Curated role demos — remix in the playground (no account needed).
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {EXAMPLE_FOLIOS.map((ex, i) => (
              <motion.article
                key={ex.id}
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.04, ease }}
                className="flex h-full flex-col rounded-2xl border border-[#0066FF]/12 bg-elevated/80 p-5 backdrop-blur-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#0066FF]/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0066FF]">
                    {ex.roleLabel}
                  </span>
                  <span className="text-[11px] text-subtle">{ex.themeName} theme</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-primary">{ex.name}</h3>
                <p className="mt-0.5 text-sm font-medium text-secondary">{ex.title}</p>
                <p className="mt-2 text-sm text-subtle">{ex.tagline}</p>
                <p className="mt-3 flex-1 text-xs leading-relaxed text-subtle">{ex.blurb}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild size="sm" className="home-cta-primary h-9 border-0 px-4 shadow-none">
                    <Link to={`/try?example=${ex.id}`}>
                      Remix this <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="home-cta-secondary h-9">
                    <Link to={`/theme-demo/${ex.themeId}`}>Preview theme</Link>
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <motion.div
          className="mt-14 rounded-2xl border border-[#0066FF]/12 bg-elevated/70 p-6 text-center backdrop-blur-sm sm:p-8"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease }}
        >
          <h2 className="font-display text-2xl text-primary sm:text-3xl">Prefer themes first?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-subtle">
            Browse every visual style with the shared demo, then open any look in the playground.
          </p>
          <MagneticCta className="mt-5">
            <Button asChild className={cn('home-cta-primary h-11 border-0 px-5 hover:bg-transparent')}>
              <Link to="/themes">
                Browse themes <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </MagneticCta>
        </motion.div>
      </div>
    </main>
  );
}
