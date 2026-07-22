import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Globe } from 'lucide-react';
import {
  formatMoney,
  getPlan,
  normalizePlanId,
  previewUpgradeDue,
  resolveCheckoutCurrency,
  type BillingInterval,
} from '@/lib/plans';
import { setCheckoutIntent, type CheckoutIntent, type PaidPlanId } from '@/lib/planCheckout';
import { useAuth } from '@/context/AuthContext';
import { CheckoutModal } from '@/components/billing/CheckoutModal';
import { DialogRoot, DialogContent } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const TARGETS: PaidPlanId[] = ['pro', 'premium'];

type GoLivePaywallProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after successful payment (user refreshed by CheckoutModal). */
  onPaid?: (planId: PaidPlanId) => void;
};

/**
 * P0-1: From publish desire → pick Pro/Premium → Razorpay checkout in one flow.
 * Keeps Free users off the full pricing page for the common path.
 */
export function GoLivePaywall({ open, onOpenChange, onPaid }: GoLivePaywallProps) {
  const { user, refreshUser } = useAuth();
  const [billing, setBilling] = useState<BillingInterval>('monthly');
  const [planId, setPlanId] = useState<PaidPlanId>('pro');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutIntent, setCheckoutIntentState] = useState<CheckoutIntent | null>(null);

  const currency = resolveCheckoutCurrency('inr');

  const options = useMemo(() => {
    const current = normalizePlanId(user?.plan);
    return TARGETS.map((id) => {
      const plan = getPlan(id);
      const due = previewUpgradeDue({
        currentPlan: current,
        targetPlan: id,
        billing,
        currency,
        currentBilling: user?.planBilling,
        currentCurrency: user?.planCurrency,
      });
      return { id, plan, due };
    }).filter((o) => o.due.ok);
  }, [billing, currency, user?.plan, user?.planBilling, user?.planCurrency]);

  const selected = options.find((o) => o.id === planId) || options[0];

  const startPay = () => {
    if (!selected?.due.ok) return;
    const intent: CheckoutIntent = {
      planId: selected.id,
      billing,
      currency,
    };
    setCheckoutIntent(intent);
    setCheckoutIntentState(intent);
    onOpenChange(false);
    setCheckoutOpen(true);
  };

  const handleCheckoutOpenChange = (next: boolean) => {
    setCheckoutOpen(next);
    if (!next) setCheckoutIntentState(null);
  };

  return (
    <>
      <DialogRoot open={open} onOpenChange={onOpenChange}>
        <DialogContent title="Go live" className="max-w-md w-[calc(100%-1.5rem)]">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl border border-[#0066FF]/15 bg-[#0066FF]/5 px-3 py-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0066FF]/12 text-[#0066FF]">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Publish needs a paid plan</p>
                <p className="mt-0.5 text-xs text-subtle">
                  Preview stays free. Upgrade to unlock your live subdomain link — pay here without
                  leaving the dashboard.
                </p>
              </div>
            </div>

            <div
              className="inline-flex rounded-xl bg-muted/70 p-1 dark:bg-muted/40"
              role="group"
              aria-label="Billing period"
            >
              {(['monthly', 'yearly'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors capitalize',
                    billing === b
                      ? 'bg-elevated text-[#0066FF] shadow-sm ring-1 ring-[#0066FF]/20'
                      : 'text-secondary hover:text-primary'
                  )}
                  onClick={() => setBilling(b)}
                >
                  {b}
                </button>
              ))}
            </div>

            <ul className="space-y-2">
              {options.map(({ id, plan, due }) => {
                const active = selected?.id === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setPlanId(id)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                        active
                          ? 'border-[#0066FF]/45 bg-[#0066FF]/8 ring-1 ring-[#0066FF]/25'
                          : 'border-border/70 hover:border-[#0066FF]/25'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                          active
                            ? 'border-[#0066FF] bg-[#0066FF] text-white'
                            : 'border-border text-transparent'
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-primary">{plan.name}</span>
                          {id === 'pro' ? (
                            <span className="rounded-full bg-[#0066FF]/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0066FF]">
                              Popular
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block text-xs text-subtle">
                          {id === 'pro'
                            ? '2 live portfolios · unlimited resume imports'
                            : '5 live portfolios · best for freelancers'}
                        </span>
                        <span className="mt-1.5 block text-sm font-semibold text-primary">
                          {due.ok ? due.dueLabel : 'Unavailable'}
                          {due.ok && due.isUpgrade ? (
                            <span className="ml-1 font-normal text-subtle">
                              (list {formatMoney(due.listMajor, currency)})
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {options.length === 0 ? (
              <p className="text-sm text-secondary">
                No upgrades available for your account.{' '}
                <Link to="/dashboard/pricing" className="font-medium text-[#0066FF] hover:underline">
                  View pricing
                </Link>
              </p>
            ) : (
              <Button
                className="home-cta-primary h-11 w-full border-0 font-semibold shadow-none"
                onClick={startPay}
                disabled={!selected?.due.ok}
              >
                <span>{selected?.due.ok ? selected.due.dueLabel : 'Unavailable'}</span>
              </Button>
            )}

            <p className="text-center text-[11px] text-subtle">
              UPI, cards, or netbanking (INR).{' '}
              <Link
                to="/dashboard/pricing"
                className="font-medium text-[#0066FF] hover:underline"
                onClick={() => onOpenChange(false)}
              >
                Compare all plans
              </Link>
            </p>
          </div>
        </DialogContent>
      </DialogRoot>

      <CheckoutModal
        open={checkoutOpen}
        intent={checkoutIntent}
        onOpenChange={handleCheckoutOpenChange}
        onPaid={async (paidId) => {
          await refreshUser();
          onPaid?.(paidId);
        }}
      />
    </>
  );
}
