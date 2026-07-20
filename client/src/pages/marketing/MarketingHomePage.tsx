import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, FileUp, Link2, Zap } from 'lucide-react';
import { BRAND } from '@/brand/constants';
import { BrandLogo, BrandMark } from '@/brand/logo';
import { getPortfolioUrlPlaceholder } from '@/lib/domains';
import { HeroAtmosphere } from '@/components/marketing/HeroAtmosphere';
import { HeroDeviceShowcase } from '@/components/marketing/HeroDeviceShowcase';
import { Button } from '@/components/ui/Button';

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

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.06 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function MarketingHomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <main>
      <section className="relative overflow-hidden">
        <HeroAtmosphere />
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 85% 20%, rgb(var(--brand) / 0.16), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 80%, rgb(0 102 255 / 0.08), transparent 50%)',
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[0.95fr_1.15fr] lg:items-center lg:gap-10 lg:pb-24 lg:pt-16">
          <div className="space-y-5">
            <motion.div
              custom={0}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
            >
              <BrandLogo size={36} className="text-base sm:text-lg" />
            </motion.div>
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="font-display text-[2.35rem] leading-[1.08] tracking-tight text-primary sm:text-5xl lg:text-[3.15rem]"
            >
              A live portfolio from your resume — in minutes.
            </motion.h1>
            <motion.p
              custom={2}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="max-w-md text-base text-secondary sm:text-lg"
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
              <Button size="lg" asChild>
                <Link to="/try">
                  Try without signup <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/themes">See themes</Link>
              </Button>
            </motion.div>
            <motion.ul
              custom={4}
              variants={fadeUp}
              initial={reduceMotion ? false : 'hidden'}
              animate="show"
              className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs text-subtle"
            >
              {TRUST.map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative min-w-0"
          >
            <HeroDeviceShowcase themeId="studio" />
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <motion.div
            className="max-w-xl"
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-3xl text-primary sm:text-4xl">From try to live URL</h2>
            <p className="mt-2 text-subtle">Start in the editor. Account only when you import or publish.</p>
          </motion.div>
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                className="relative"
                initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <p className="font-mono text-xs text-accent">{step.n}</p>
                <step.icon className="mt-3 h-5 w-5 text-accent" />
                <h3 className="mt-3 text-base font-semibold text-primary">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-subtle">{step.body}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="mt-10 flex flex-wrap gap-3"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Button asChild>
              <Link to="/try">
                Open try editor <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/pricing">View pricing</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/50">
        <motion.div
          className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16 sm:px-6 sm:py-20 md:flex-row md:items-center md:justify-between"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start gap-4">
            <motion.div whileHover={reduceMotion ? undefined : { scale: 1.05, rotate: -3 }}>
              <BrandMark size={44} className="shrink-0" />
            </motion.div>
            <div>
              <h2 className="font-display text-2xl text-primary sm:text-3xl">{BRAND.shortTagline}</h2>
              <p className="mt-2 max-w-md text-subtle">
                Open the editor free — create an account only when you import or publish.
              </p>
            </div>
          </div>
          <motion.div whileHover={reduceMotion ? undefined : { scale: 1.03 }} whileTap={reduceMotion ? undefined : { scale: 0.98 }}>
            <Button size="lg" asChild>
              <Link to="/try">
                Try {BRAND.name} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
