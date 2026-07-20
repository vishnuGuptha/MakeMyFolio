import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles, Upload, Palette, Globe } from 'lucide-react';
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
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <BrandLogo size={40} className="text-lg sm:text-xl" />
            <h1 className="font-display text-4xl leading-[1.1] text-primary sm:text-5xl lg:text-[3.25rem]">
              A live portfolio from your resume — in minutes.
            </h1>
            <p className="max-w-xl text-base text-secondary sm:text-lg">{BRAND.tagline}</p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/try">
                  Try without signup <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/examples">See examples</Link>
              </Button>
            </div>
            <p className="text-xs text-subtle">
              Guest drafts clear on refresh. Import & publish need a free account.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-[rgb(var(--brand)/0.12)] blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-elevated shadow-glass-lg">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 font-mono text-[10px] text-subtle">
                  {getPortfolioUrlPlaceholder()}
                </span>
              </div>
              <div className="p-2 sm:p-3">
                <ThemeLiveHeroFrame themeId="studio" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="border-t border-border/50 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl text-primary sm:text-4xl">How it works</h2>
          <p className="mt-2 max-w-xl text-subtle">Three steps from blank page to a shareable URL.</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Upload,
                title: 'Import your resume',
                body: 'Upload a PDF after you create a free account — we fill skills, roles, and projects.',
              },
              {
                icon: Palette,
                title: 'Pick a theme',
                body: 'Olive, Studio, Terminal, and more — switch anytime without losing content.',
              },
              {
                icon: Globe,
                title: 'Publish your URL',
                body: `Go live at ${getPortfolioUrlPlaceholder().replace('your-name', 'your-slug')}. Preview privately until you’re ready.`,
              },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl border border-border bg-elevated/50 p-6">
                <step.icon className="h-6 w-6 text-accent" />
                <h3 className="mt-4 font-semibold text-primary">{step.title}</h3>
                <p className="mt-2 text-sm text-subtle">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Themes */}
      <section id="themes" className="border-t border-border/50 scroll-mt-20 bg-elevated/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-primary sm:text-4xl">Themes that feel designed</h2>
              <p className="mt-2 text-subtle">Browse the look — try them live in the guest editor.</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/try">Open try mode</Link>
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
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl text-primary sm:text-4xl">Live examples</h2>
          <p className="mt-2 text-subtle">Published folios on {BRAND.name}.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examples.length === 0 ? (
              <p className="text-sm text-subtle col-span-full">
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
                  className="group rounded-xl border border-border bg-elevated/40 p-5 transition-colors hover:border-accent/40"
                >
                  <p className="font-semibold text-primary group-hover:text-accent">{p.displayName}</p>
                  <p className="mt-1 font-mono text-xs text-subtle">
                    {getPublicPortfolioLabel(p.slug)}
                  </p>
                </a>
              ))
            )}
          </div>
          <Button variant="ghost" className="mt-6" asChild>
            <Link to="/examples">
              View all examples <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-t border-border/50 bg-elevated/20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 text-center">
          <Sparkles className="mx-auto h-6 w-6 text-accent" />
          <p className="mt-4 font-display text-2xl text-primary sm:text-3xl">Built for builders</p>
          <p className="mx-auto mt-3 max-w-lg text-subtle">
            Engineers and designers use {BRAND.name} to stop wrestling with HTML templates and start
            sharing a curated URL.
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border/50 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl text-primary sm:text-4xl">Simple pricing</h2>
          <p className="mt-2 text-subtle">Start free. Upgrade when you need more folios and themes.</p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'flex flex-col rounded-2xl border p-6',
                  plan.highlighted
                    ? 'border-accent/50 bg-accent/5 shadow-glass'
                    : 'border-border bg-elevated/40'
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
                <ul className="mt-6 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-secondary">
                      <Check className="h-4 w-4 shrink-0 text-accent" />
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
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-20 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <BrandMark size={48} />
            <div>
              <h2 className="font-display text-3xl text-primary">{BRAND.shortTagline}</h2>
              <p className="mt-2 text-subtle">Try the editor free — account only when you import or publish.</p>
            </div>
          </div>
          <Button size="lg" asChild>
            <Link to="/try">
              Start building <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
