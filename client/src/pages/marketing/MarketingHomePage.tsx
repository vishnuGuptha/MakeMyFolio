import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Check, FileUp, Link2, Sparkles, Zap } from 'lucide-react';
import { useRef } from 'react';
import { BRAND } from '@/brand/constants';
import { BrandMark } from '@/brand/logo';
import { getPortfolioUrlPlaceholder } from '@/lib/domains';
import { HomeLivingScene } from '@/components/marketing/HomeLivingScene';
import { HeroDeviceShowcase } from '@/components/marketing/HeroDeviceShowcase';
import { GlassTiltCard, MagneticCta } from '@/components/marketing/HomeInteractions';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

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

const PROOF = [
  { label: 'Themes', value: '7+' },
  { label: 'Guest try', value: 'Free' },
  { label: 'Publish', value: 'Subdomain URL' },
];

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.07 * i, ease },
  }),
};

const reveal = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease },
  },
};

export default function MarketingHomePage() {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [0, 40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], reduceMotion ? [1, 1] : [1, 0.65]);

  return (
    <main className="relative overflow-hidden">
      <HomeLivingScene />

      {/* Hero — badge, H1, tagline, CTAs, floating devices */}
      <section ref={heroRef} className="relative min-h-[min(90vh,880px)]">
        <motion.div
          className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12 lg:pb-20 lg:pt-16"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          <div className="space-y-5 sm:space-y-6">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-[#0066FF]/20 bg-[#0066FF]/[0.06] px-3 py-1.5 text-xs font-medium text-[#0066FF] shadow-sm backdrop-blur-md dark:border-[#0066FF]/30 dark:bg-[#0066FF]/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Live folio in minutes — try free</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="font-display text-[2.75rem] leading-[1.06] tracking-tight text-primary sm:text-5xl lg:text-[3.5rem]"
            >
              A live portfolio from your resume —{' '}
              <span className="bg-gradient-to-r from-[#0066FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                in minutes.
              </span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="max-w-md text-base leading-relaxed text-secondary sm:text-lg"
            >
              {BRAND.tagline}
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              <MagneticCta>
                <Button
                  size="lg"
                  asChild
                  className={cn('home-cta-primary h-12 border-0 px-6 text-base shadow-none hover:bg-transparent')}
                >
                  <Link to="/try">
                    Try free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </MagneticCta>
              <MagneticCta strength={6}>
                <Button size="lg" variant="ghost" asChild className="h-12 px-5 text-secondary hover:text-primary">
                  <Link to="/themes">See themes</Link>
                </Button>
              </MagneticCta>
            </motion.div>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease }}
            className="relative min-w-0"
          >
            <div className="pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-br from-[#0066FF]/30 via-indigo-500/15 to-emerald-400/20 blur-3xl home-breath" />
            <HeroDeviceShowcase />
          </motion.div>
        </motion.div>

        <div className="home-section-blend home-section-blend-bottom" />
      </section>

      {/* Trust strip — moved out of hero stack */}
      <section className="relative z-10 border-y border-border/50 bg-elevated/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-10 md:py-7">
          <ul className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm text-secondary">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0066FF]/12 text-[#0066FF]">
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

      <div className="home-flow-divider relative z-10 mx-auto mt-2 max-w-4xl" />

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
            <h2 className="font-display text-3xl tracking-tight text-primary sm:text-4xl lg:text-[2.75rem]">
              From try to live URL
            </h2>
            <p className="mt-3 text-base text-subtle sm:text-lg">
              Start in the editor. Account only when you import or publish.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6" style={{ perspective: 1400 }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1, ease }}
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
                  Try free <ArrowRight className="h-4 w-4" />
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
              'radial-gradient(ellipse 60% 80% at 90% 50%, rgb(0 102 255 / 0.14), transparent 55%), radial-gradient(ellipse 40% 60% at 0% 80%, rgb(16 185 129 / 0.1), transparent 50%)',
          }}
        />
        <motion.div
          className="relative z-10 mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 home-section-pad sm:px-6 md:flex-row md:items-center md:justify-between"
          initial={reduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="flex items-start gap-5">
            <div className="home-glass-card !p-3 shrink-0">
              <BrandMark size={44} />
            </div>
            <div>
              <h2 className="font-display text-2xl tracking-tight text-primary sm:text-3xl lg:text-[2.35rem]">
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
                Try free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </MagneticCta>
        </motion.div>
      </section>
    </main>
  );
}
