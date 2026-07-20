import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { BRAND } from '@/brand/constants';
import { PLANS } from '@/lib/plans';
import { GlassTiltCard, MagneticCta } from '@/components/marketing/HomeInteractions';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const ease = [0.22, 1, 0.36, 1] as const;

export default function PricingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-100 dark:opacity-90"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 15% 0%, rgb(0 102 255 / 0.2), transparent 55%), radial-gradient(ellipse 45% 40% at 90% 20%, rgb(16 185 129 / 0.14), transparent 50%), radial-gradient(ellipse 35% 30% at 50% 100%, rgb(99 102 241 / 0.1), transparent 55%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <motion.div
          className="max-w-xl"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
            Pricing
          </p>
          <h1 className="font-display text-4xl text-primary sm:text-5xl">
            Simple plans that grow with you
          </h1>
          <p className="mt-3 text-base text-subtle sm:text-lg">
            Start free on {BRAND.name}. Upgrade when you need more folios and themes.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3" style={{ perspective: 1400 }}>
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease }}
              className="h-full"
            >
              <GlassTiltCard
                className={cn(
                  'flex h-full flex-col',
                  plan.highlighted && 'ring-1 ring-[#0066FF]/35 shadow-[0_0_40px_-16px_rgb(0_102_255/0.45)]'
                )}
              >
                {plan.highlighted && (
                  <span className="mb-3 w-fit rounded-full bg-[#0066FF]/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0066FF]">
                    Popular
                  </span>
                )}
                <h2 className="text-lg font-semibold text-primary">{plan.name}</h2>
                <p className="mt-1 text-sm text-subtle">{plan.description}</p>
                <p className="mt-4">
                  <span className="text-3xl font-bold tracking-tight text-primary">{plan.price}</span>
                  <span className="ml-1 text-sm text-subtle">{plan.priceNote}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-secondary">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0066FF]/12 text-[#0066FF]">
                        <Check className="h-3 w-3" strokeWidth={2.5} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <MagneticCta className="mt-8 w-full">
                  <Button
                    className={cn(
                      'w-full',
                      plan.highlighted
                        ? 'home-cta-primary h-11 border-0 hover:bg-transparent'
                        : 'home-cta-secondary h-11'
                    )}
                    variant={plan.highlighted ? 'default' : 'outline'}
                    asChild
                  >
                    <Link to={plan.ctaTo}>{plan.cta}</Link>
                  </Button>
                </MagneticCta>
              </GlassTiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
