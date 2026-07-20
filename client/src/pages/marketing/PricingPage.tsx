import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { BRAND } from '@/brand/constants';
import { PLANS } from '@/lib/plans';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-xl">
        <h1 className="font-display text-4xl text-primary">Pricing</h1>
        <p className="mt-2 text-subtle">
          Start free on {BRAND.name}. Upgrade when you need more folios and themes.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'flex flex-col rounded-2xl border p-6',
              plan.highlighted
                ? 'border-accent/50 bg-accent/5 shadow-glass'
                : 'border-border bg-elevated/30'
            )}
          >
            {plan.highlighted && (
              <span className="mb-2 w-fit rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                Popular
              </span>
            )}
            <h2 className="text-lg font-semibold text-primary">{plan.name}</h2>
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
    </main>
  );
}
