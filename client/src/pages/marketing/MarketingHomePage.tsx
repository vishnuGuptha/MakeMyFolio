import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, FileUp, Link2, Sparkles, Zap } from 'lucide-react';
import { BRAND } from '@/brand/constants';
import { BrandLogo, BrandMark } from '@/brand/logo';
import { getPortfolioUrlPlaceholder } from '@/lib/domains';
import { HeroBackdrop } from '@/components/marketing/HeroBackdrop';
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

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.07 * i, ease },
  }),
};

export default function MarketingHomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[min(92vh,920px)]">
        <HeroBackdrop />

        <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1fr_1.12fr] lg:items-center lg:gap-12 lg:pb-28 lg:pt-20">
          <div className="space-y-6 sm:space-y-8">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-elevated/40 px-3 py-1.5 text-xs text-secondary shadow-sm backdrop-blur-md dark:border-white/10"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#0066FF]" />
              <span>Live folio in minutes — try free</span>
            </motion.div>

            <motion.div
              custom={1}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
            >
              <BrandLogo size={40} className="text-lg sm:text-xl" />
            </motion.div>

            <motion.h1
              custom={2}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="font-display text-[2.6rem] leading-[1.05] tracking-tight text-primary sm:text-5xl lg:text-[3.4rem]"
            >
              A live portfolio from your resume —{' '}
              <span className="bg-gradient-to-r from-[#0066FF] via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
                in minutes.
              </span>
            </motion.h1>

            <motion.p
              custom={3}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="max-w-md text-base leading-relaxed text-secondary sm:text-lg"
            >
              {BRAND.tagline}
            </motion.p>

            <motion.div
              custom={4}
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
                    Try without signup <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </MagneticCta>
              <MagneticCta strength={6}>
                <Button size="lg" variant="outline" asChild className="home-cta-secondary h-12 px-6">
                  <Link to="/themes">See themes</Link>
                </Button>
              </MagneticCta>
            </motion.div>

            <motion.ul
              custom={5}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-xs text-subtle sm:text-[13px]"
            >
              {TRUST.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0066FF]/10 text-[#0066FF]">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 36, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.18, ease }}
            className="relative min-w-0"
          >
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-[#0066FF]/20 via-indigo-500/10 to-emerald-400/15 blur-2xl" />
            <div className="home-device-stage relative">
              <HeroDeviceShowcase themeId="studio" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-t border-border/40">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#0066FF]/[0.03] to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 home-section-pad sm:px-6">
          <motion.div
            className="max-w-xl"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease }}
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

          <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6" style={{ perspective: 1200 }}>
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: i * 0.09, ease }}
              >
                <GlassTiltCard>
                  <p className="font-mono text-[11px] font-medium tracking-wide text-[#0066FF]">
                    {step.n}
                  </p>
                  <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0066FF]/15 to-cyan-400/10 text-[#0066FF] ring-1 ring-[#0066FF]/15">
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
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.12, ease }}
          >
            <MagneticCta>
              <Button asChild className="home-cta-primary h-11 border-0 px-5 hover:bg-transparent">
                <Link to="/try">
                  Open try editor <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </MagneticCta>
            <MagneticCta strength={6}>
              <Button variant="outline" asChild className="home-cta-secondary h-11 px-5">
                <Link to="/pricing">View pricing</Link>
              </Button>
            </MagneticCta>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative border-t border-border/40 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 90% 50%, rgb(0 102 255 / 0.12), transparent 55%), radial-gradient(ellipse 40% 60% at 0% 80%, rgb(16 185 129 / 0.08), transparent 50%)',
          }}
        />
        <motion.div
          className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 home-section-pad sm:px-6 md:flex-row md:items-center md:justify-between"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
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
            <Button size="lg" asChild className="home-cta-primary h-12 border-0 px-7 text-base hover:bg-transparent">
              <Link to="/try">
                Try {BRAND.name} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </MagneticCta>
        </motion.div>
      </section>
    </main>
  );
}
