import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check, FileUp, Link2, Zap } from 'lucide-react';
import { useRef } from 'react';
import { BRAND } from '@/brand/constants';
import { BrandMark } from '@/brand/logo';
import { getPortfolioUrlPlaceholder } from '@/lib/domains';
import { DeferredHomeLivingScene } from '@/components/marketing/DeferredHomeLivingScene';
import { HeroDeviceShowcase } from '@/components/marketing/HeroDeviceShowcase';
import { GlassTiltCard, MagneticCta } from '@/components/marketing/HomeInteractions';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const STEPS = [
  {
    n: '01',
    icon: Zap,
    title: 'Open the playground',
    body: 'Pick a theme and edit your portfolio right away. No account needed.',
  },
  {
    n: '02',
    icon: FileUp,
    title: 'Save your work',
    body: 'Create a free account to upload your resume and keep your draft forever.',
  },
  {
    n: '03',
    icon: Link2,
    title: 'Share your link',
    body: `Publish to ${getPortfolioUrlPlaceholder()} and share it with anyone.`,
  },
];

const TRUST = [
  'No credit card to start',
  'Guest playground in under a minute',
  'Your own subdomain URL',
];

const PROOF = [
  { label: 'Themes', value: '7+' },
  { label: 'Guest try', value: 'Free' },
  { label: 'Publish', value: 'Subdomain URL' },
];

const ease = [0.22, 1, 0.36, 1] as const;

const reveal = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease },
  },
};

const urlHost = getPortfolioUrlPlaceholder();

export default function MarketingHomePage() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 36]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], reduceMotion ? [1, 1] : [1, 0.7]);

  return (
    <main className="relative overflow-hidden">
      <DeferredHomeLivingScene />

      {/* Hero — paint visible immediately (no opacity-0) for LCP */}
      <section ref={heroRef} className="relative min-h-[min(82vh,800px)]">
        <motion.div
          className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-4 sm:px-6 lg:grid-cols-[0.95fr_1.15fr] lg:items-center lg:gap-10 lg:pb-14 lg:pt-6"
          style={reduceMotion ? undefined : { y: heroY, opacity: heroOpacity }}
        >
          <div className="space-y-4 sm:space-y-5">
            <div className="inline-flex items-center rounded-full border border-[#0066FF]/25 bg-[#0066FF]/[0.08] px-3 py-1.5 text-xs font-semibold text-[#0066FF] dark:border-[#0066FF]/35 dark:bg-[#0066FF]/15">
              No signup needed
            </div>

            <h1 className="font-display text-[2.65rem] leading-[1.05] text-primary sm:text-5xl lg:text-[3.35rem]">
              A live portfolio from your resume —{' '}
              <span className="bg-gradient-to-r from-[#0066FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                in minutes.
              </span>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-secondary sm:text-lg">
              {BRAND.tagline}
            </p>

            <div className="space-y-3 pt-0.5">
              <div className="flex flex-wrap items-center gap-3">
                <MagneticCta>
                  <Button
                    size="lg"
                    asChild
                    className={cn('home-cta-primary h-12 border-0 px-6 text-base shadow-none hover:bg-transparent')}
                  >
                    <Link to="/try">
                      Open playground <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </MagneticCta>
                <MagneticCta strength={6}>
                  <Button size="lg" variant="ghost" asChild className="h-12 px-4 text-secondary hover:text-primary">
                    <Link to="/themes">See themes</Link>
                  </Button>
                </MagneticCta>
              </div>
              <p className="text-xs text-subtle sm:text-[13px]">
                7 themes · free playground · your subdomain
              </p>
            </div>
          </div>

          <div className="relative min-w-0">
            {/* Darker radial behind devices for drama */}
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2.5rem] opacity-90"
              style={{
                background:
                  'radial-gradient(ellipse 70% 65% at 55% 45%, rgb(15 23 42 / 0.22), transparent 70%), radial-gradient(ellipse 50% 50% at 70% 30%, rgb(0 102 255 / 0.35), transparent 60%)',
              }}
            />
            <div className="pointer-events-none absolute -inset-8 rounded-full bg-gradient-to-br from-[#0066FF]/35 via-indigo-500/20 to-cyan-400/25 blur-3xl home-breath" />
            {/* Ambient rings near product */}
            {!reduceMotion && (
              <>
                <div className="home-ring home-spin-slow pointer-events-none absolute -right-2 top-8 h-24 w-24 opacity-50" />
                <div className="home-ring home-ring-cyan home-spin-rev pointer-events-none absolute bottom-16 left-4 h-16 w-16 opacity-40" />
              </>
            )}
            <HeroDeviceShowcase />
          </div>
        </motion.div>

        <div className="home-section-blend home-section-blend-bottom" />
      </section>

      {/* Trust strip */}
      <section className="relative z-10 border-y border-[#0066FF]/10 bg-gradient-to-r from-[rgb(0_102_255/0.06)] via-elevated/80 to-[rgb(6_182_212/0.07)] backdrop-blur-sm dark:border-border/50 dark:from-transparent dark:via-elevated/50 dark:to-transparent">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-10 md:py-7">
          <ul className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-secondary">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0066FF]/15 text-[#0066FF]">
                  <Check className="h-3 w-3" strokeWidth={2.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-6 md:gap-8">
            {PROOF.map((p) => (
              <div key={p.label} className="min-w-[4.5rem]">
                <p className="text-sm font-semibold tracking-tight text-primary">{p.value}</p>
                <p className="text-[11px] uppercase tracking-[0.12em] text-subtle">{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mid-page beat — URL reveal */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 dark:opacity-100 opacity-100"
          style={{
            background:
              'radial-gradient(ellipse 55% 50% at 50% 40%, rgb(0 102 255 / 0.16), transparent 65%), radial-gradient(ellipse 40% 35% at 80% 60%, rgb(6 182 212 / 0.1), transparent 60%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-4 home-section-pad sm:px-6">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            variants={reveal}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
              Your live URL
            </p>
            <h2 className="font-display text-3xl text-primary sm:text-4xl">
              Publish to a link that looks like you
            </h2>
            <p className="mt-3 text-base text-subtle">
              Share a clean subdomain the moment you&apos;re ready — no hosting setup.
            </p>
          </motion.div>

          <motion.div
            className="home-url-reveal mx-auto mt-10 max-w-xl"
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease }}
          >
            <div className="flex items-center gap-2 border-b border-white/15 px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-red-400/90" />
              <span className="h-2 w-2 rounded-full bg-amber-400/90" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
              <span className="ml-2 font-mono text-[10px] text-zinc-400">HTTPS</span>
            </div>
            <p className="px-4 py-5 text-center font-mono text-base tracking-tight text-white sm:text-xl md:text-2xl">
              <span className="text-[#60a5fa]">https://</span>
              <motion.span
                className="inline-block text-white"
                initial={reduceMotion ? false : { opacity: 0.35 }}
                whileInView={
                  reduceMotion
                    ? undefined
                    : {
                        opacity: [0.35, 1, 1],
                      }
                }
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease }}
              >
                {urlHost}
              </motion.span>
            </p>
          </motion.div>
        </div>
      </section>

      <div className="home-flow-divider relative z-10 mx-auto max-w-4xl" />

      {/* How it works */}
      <section className="relative">
        <div className="home-section-blend home-section-blend-top" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0066FF]/[0.04] to-transparent" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 home-section-pad sm:px-6">
          <motion.div
            className="max-w-xl"
            variants={reveal}
            initial={reduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
              How it works
            </p>
            <h2 className="font-display text-3xl text-primary sm:text-4xl lg:text-[2.75rem]">
              Three simple steps
            </h2>
            <p className="mt-3 text-base text-subtle sm:text-lg">
              Start free. Sign up only when you want to save or publish.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6" style={{ perspective: 1400 }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.09, ease }}
              >
                <GlassTiltCard>
                  <p className="font-mono text-[11px] font-medium tracking-wide text-[#0066FF]">
                    {step.n}
                  </p>
                  <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF]/15 to-cyan-400/10 text-[#0066FF] ring-1 ring-[#0066FF]/15 transition-transform duration-300 group-hover:scale-110">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-subtle">{step.body}</p>
                </GlassTiltCard>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 flex flex-wrap gap-3"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1, ease }}
          >
            <MagneticCta>
              <Button asChild className="home-cta-primary h-11 border-0 px-5 hover:bg-transparent">
                <Link to="/try">
                  Open playground <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </MagneticCta>
            <MagneticCta strength={6}>
              <Button variant="ghost" asChild className="h-11 px-5 text-secondary">
                <Link to="/pricing">View pricing</Link>
              </Button>
            </MagneticCta>
          </motion.div>
        </div>

        <div className="home-section-blend home-section-blend-bottom" />
      </section>

      <div className="home-flow-divider relative z-10 mx-auto max-w-4xl" />

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="home-section-blend home-section-blend-top" />
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 90% 50%, rgb(0 102 255 / 0.16), transparent 55%), radial-gradient(ellipse 40% 60% at 0% 80%, rgb(16 185 129 / 0.1), transparent 50%)',
          }}
        />
        <motion.div
          className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 home-section-pad sm:px-6 md:flex-row md:items-center md:justify-between"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="flex items-start gap-5">
            <div className="home-glass-card !p-3 shrink-0">
              <BrandMark size={44} />
            </div>
            <div>
              <h2 className="font-display text-2xl text-primary sm:text-3xl lg:text-[2.35rem]">
                {BRAND.shortTagline}
              </h2>
              <p className="mt-3 max-w-md text-base text-subtle">
                Open the editor free — create an account only when you import or publish.
              </p>
            </div>
          </div>
          <MagneticCta>
            <Button
              size="lg"
              asChild
              className="home-cta-primary h-12 border-0 px-7 text-base hover:bg-transparent"
            >
              <Link to="/try">
                Open playground <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </MagneticCta>
        </motion.div>
      </section>
    </main>
  );
}
