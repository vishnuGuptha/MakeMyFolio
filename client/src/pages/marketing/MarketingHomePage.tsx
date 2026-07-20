import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, FileUp, LayoutTemplate, Link2, Zap } from 'lucide-react';
import { publicApi } from '@/api';
import { BRAND } from '@/brand/constants';
import { BrandLogo, BrandMark } from '@/brand/logo';
import { PLANS } from '@/lib/plans';
import { getPortfolioUrlPlaceholder } from '@/lib/domains';
import { PORTFOLIO_THEME_LIST } from '@/themes/registry';
import { ThemeLiveCard, ThemeLiveHeroFrame } from '@/components/marketing/ThemeLiveCard';
import { Button } from '@/components/ui/Button';
import { cn, getPublicPortfolioLabel, getPublicPortfolioUrl } from '@/lib/utils';
import type { PortfolioProfile } from '@/types';

const STEPS = [
  {
    n: '01',
    icon: Zap,
    title: 'Try the editor',
    body: 'Open a live theme, edit content, and preview — no account required.',
  },
  {
    n: '02',
    icon: FileUp,
    title: 'Import or refine',
    body: 'Sign up free to import a resume and keep your draft permanently.',
  },
  {
    n: '03',
    icon: Link2,
    title: 'Publish your URL',
    body: `Go live at ${getPortfolioUrlPlaceholder().replace('your-name', 'you')}. Share when you’re ready.`,
  },
];

const TRUST = [
  'No credit card to start',
  'Guest try in under a minute',
  'Your own subdomain URL',
];

export default function MarketingHomePage() {
  const [examples, setExamples] = useState<PortfolioProfile[]>([]);

  useEffect(() => {
    publicApi
      .getProfiles()
      .then((list) => setExamples(list.filter((p) => p.isPublished).slice(0, 6)))
      .catch(() => setExamples([]));
  }, []);

  return (
    <main>
      {/* Hero — one composition */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 85% 20%, rgb(var(--brand) / 0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, rgb(var(--brand) / 0.06), transparent 50%)',
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-5"
          >
            <BrandLogo size={36} className="text-base sm:text-lg" />
            <h1 className="font-display text-[2.35rem] leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-[3.15rem]">
              A live portfolio from your resume — in minutes.
            </h1>
            <p className="max-w-md text-base text-secondary sm:text-lg">{BRAND.tagline}</p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button size="lg" asChild>
                <Link to="/try">
                  Try without signup <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/examples">See examples</Link>
              </Button>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs text-subtle">
              {TRUST.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="relative min-w-0"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-elevated shadow-glass-lg">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2 sm:px-4 sm:py-2.5">
                <span className="h-2 w-2 rounded-full bg-red-400/80 sm:h-2.5 sm:w-2.5" />
                <span className="h-2 w-2 rounded-full bg-amber-400/80 sm:h-2.5 sm:w-2.5" />
                <span className="h-2 w-2 rounded-full bg-emerald-400/80 sm:h-2.5 sm:w-2.5" />
                <span className="ml-1 truncate font-mono text-[10px] text-subtle sm:ml-2">
                  {getPortfolioUrlPlaceholder()}
                </span>
              </div>
              <div className="p-1.5 sm:p-2.5">
                <ThemeLiveHeroFrame themeId="studio" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="scroll-mt-20 border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-primary sm:text-4xl">From try to live URL</h2>
            <p className="mt-2 text-subtle">Start in the editor. Account only when you import or publish.</p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
            {STEPS.map((step) => (
              <div key={step.n} className="relative">
                <p className="font-mono text-xs text-accent">{step.n}</p>
                <step.icon className="mt-3 h-5 w-5 text-accent" />
                <h3 className="mt-3 text-base font-semibold text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-subtle">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button asChild>
              <Link to="/try">
                Open try editor <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Themes */}
      <section id="themes" className="scroll-mt-20 border-t border-border/50 bg-elevated/25">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-lg">
              <h2 className="font-display text-3xl text-primary sm:text-4xl">Themes that feel designed</h2>
              <p className="mt-2 text-subtle">Pick a look in try mode — switch anytime without losing content.</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/try">
                <LayoutTemplate className="h-4 w-4" /> Try themes
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PORTFOLIO_THEME_LIST.map((theme) => (
              <ThemeLiveCard
                key={theme.id}
                themeId={theme.id}
                name={theme.name}
                description={theme.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-primary sm:text-4xl">Live examples</h2>
              <p className="mt-2 text-subtle">Real portfolios published on {BRAND.name}.</p>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/examples">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {examples.length === 0 ? (
              <p className="col-span-full text-sm text-subtle">
                No published examples yet —{' '}
                <Link to="/try" className="text-accent hover:underline">
                  be the first
                </Link>
                .
              </p>
            ) : (
              examples.map((p) => (
                <a
                  key={p._id}
                  href={getPublicPortfolioUrl(p.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-border px-5 py-4 transition-colors hover:border-accent/40 hover:bg-elevated/40"
                >
                  <p className="font-semibold text-primary group-hover:text-accent">{p.displayName}</p>
                  <p className="mt-1 font-mono text-xs text-subtle">{getPublicPortfolioLabel(p.slug)}</p>
                </a>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-t border-border/50 bg-elevated/20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl text-primary sm:text-4xl">Simple pricing</h2>
            <p className="mt-2 text-subtle">Start free. Upgrade when you need more folios and themes.</p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'flex flex-col rounded-2xl border p-6',
                  plan.highlighted
                    ? 'border-accent/50 bg-accent/5 shadow-glass'
                    : 'border-border bg-base/60'
                )}
              >
                {plan.highlighted && (
                  <span className="mb-2 w-fit rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                    Popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-primary">{plan.name}</h3>
                <p className="mt-1 text-sm text-subtle">{plan.description}</p>
                <p className="mt-4">
                  <span className="text-3xl font-bold text-primary">{plan.price}</span>
                  <span className="ml-1 text-sm text-subtle">{plan.priceNote}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-secondary">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-8 w-full" variant={plan.highlighted ? 'default' : 'outline'} asChild>
                  <Link to={plan.ctaTo}>{plan.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-20 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <BrandMark size={44} className="shrink-0" />
            <div>
              <h2 className="font-display text-2xl text-primary sm:text-3xl">{BRAND.shortTagline}</h2>
              <p className="mt-2 max-w-md text-subtle">
                Open the editor free — create an account only when you import or publish.
              </p>
            </div>
          </div>
          <Button size="lg" asChild>
            <Link to="/try">
              Try {BRAND.name} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
