import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Info, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { billingApi } from '@/api';
import {
  PLANS,
  formatPlanPrice,
  formatMoney,
  previewUpgradeDue,
  normalizePlanId,
  readStoredCurrency,
  storeCurrency,
  type BillingInterval,
  type PlanId,
  type PricingCurrency,
} from '@/lib/plans';
import {
  addToCart,
  buildAuthPath,
  cartCount,
  clearCheckoutIntent,
  consumeOpenCheckoutAfterAuth,
  DASHBOARD_CART_PATH,
  markOpenCheckoutAfterAuth,
  PRICING_CHECKOUT_NEXT,
  PUBLIC_CART_PATH,
  readCheckoutIntent,
  removeFromCartByPlanId,
  setCheckoutIntent,
  subscribeCart,
  type CheckoutIntent,
  type PaidPlanId,
} from '@/lib/planCheckout';
import { useAuth } from '@/context/AuthContext';
import { GlassTiltCard, MagneticCta } from '@/components/marketing/HomeInteractions';
import { CheckoutModal } from '@/components/billing/CheckoutModal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/apiError';

const ease = [0.22, 1, 0.36, 1] as const;

function normalizePlan(raw?: string | null): PlanId {
  return normalizePlanId(raw);
}

function isPaidPlan(id: PlanId): id is PaidPlanId {
  return id === 'pro' || id === 'premium' || id === 'domain';
}

export default function PricingPage() {
  const reduceMotion = useReducedMotion();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inDashboard = pathname.startsWith('/dashboard');
  const cartPath = inDashboard ? DASHBOARD_CART_PATH : PUBLIC_CART_PATH;
  const [searchParams, setSearchParams] = useSearchParams();
  const [billing, setBilling] = useState<BillingInterval>('monthly');
  const [currency, setCurrency] = useState<PricingCurrency>(() => readStoredCurrency());
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutIntent, setCheckoutIntentState] = useState<CheckoutIntent | null>(null);
  const [cartItems, setCartItems] = useState(() => cartCount());
  const currentPlan = user?.role === 'user' ? normalizePlan(user.plan) : null;
  const isLoggedIn = user?.role === 'user';

  useEffect(() => subscribeCart(() => setCartItems(cartCount())), []);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (!consumeOpenCheckoutAfterAuth()) return;
    const intent = readCheckoutIntent();
    if (!intent) return;
    setBilling(intent.billing);
    setCurrency(intent.currency);
    setCheckoutIntentState(intent);
    setCheckoutOpen(true);
  }, [isLoggedIn]);

  /** Stripe redirect return */
  useEffect(() => {
    const payment = searchParams.get('payment');
    if (!payment) return;

    const handledKey = `bmf-payment-${searchParams.get('session_id') || searchParams.toString()}`;
    try {
      if (sessionStorage.getItem(handledKey) === '1') {
        const next = new URLSearchParams(searchParams);
        next.delete('payment');
        next.delete('plan');
        next.delete('session_id');
        setSearchParams(next, { replace: true });
        return;
      }
      sessionStorage.setItem(handledKey, '1');
    } catch {
      /* ignore */
    }

    const planParam = searchParams.get('plan');
    const planId = isPaidPlan(planParam as PlanId) ? (planParam as PaidPlanId) : null;
    const sessionId = searchParams.get('session_id');

    const clearQs = () => {
      const next = new URLSearchParams(searchParams);
      next.delete('payment');
      next.delete('plan');
      next.delete('session_id');
      setSearchParams(next, { replace: true });
    };

    if (payment === 'cancelled') {
      const intent = readCheckoutIntent();
      if (intent) {
        addToCart(intent);
        clearCheckoutIntent();
        setCartItems(cartCount());
      } else if (planId) {
        addToCart({
          planId,
          billing,
          currency,
        });
        setCartItems(cartCount());
      }
      toast.message('Checkout cancelled', {
        description: 'Your plan is saved in the cart — resume anytime.',
      });
      clearQs();
      return;
    }

    if (payment === 'success' && isLoggedIn) {
      (async () => {
        try {
          if (sessionId) {
            await billingApi.confirmStripe(sessionId);
          }
          await refreshUser();
          if (planId) removeFromCartByPlanId(planId);
          clearCheckoutIntent();
          setCartItems(cartCount());
          toast.success('Payment successful', {
            description: planId
              ? `${PLANS.find((p) => p.id === planId)?.name || 'Plan'} is now active.`
              : 'Your plan is now active.',
          });
        } catch (err) {
          toast.error(errorMessage(err, 'Could not confirm payment — refresh in a moment'));
          await refreshUser().catch(() => undefined);
        } finally {
          clearQs();
        }
      })();
    } else if (payment === 'success') {
      clearQs();
    }
  }, [searchParams, isLoggedIn, billing, currency, refreshUser, setSearchParams]);

  const setCurrencyPersist = (next: PricingCurrency) => {
    setCurrency(next);
    storeCurrency(next);
  };

  const openCheckout = (planId: PaidPlanId) => {
    const intent: CheckoutIntent = { planId, billing, currency };
    setCheckoutIntent(intent);
    setCheckoutIntentState(intent);
    setCheckoutOpen(true);
  };

  const startPaidPlan = (planId: PaidPlanId) => {
    if (planId === 'domain') {
      toast.message('Coming soon…', {
        description: 'Custom domain is not available for purchase yet.',
      });
      return;
    }

    const due = previewUpgradeDue({
      currentPlan: currentPlan || 'free',
      targetPlan: planId,
      billing,
      currency,
      currentBilling: user?.planBilling,
      currentCurrency: user?.planCurrency,
    });
    if (isLoggedIn && !due.ok) {
      toast.message(due.reason || 'Unavailable');
      return;
    }

    const intent: CheckoutIntent = { planId, billing, currency };
    setCheckoutIntent(intent);

    if (isLoggedIn) {
      openCheckout(planId);
      return;
    }

    markOpenCheckoutAfterAuth();
    toast.message('Sign in to continue', {
      description: `We’ll open ${PLANS.find((p) => p.id === planId)?.name} checkout right after you sign in.`,
    });
    navigate(buildAuthPath('/login', { next: PRICING_CHECKOUT_NEXT }));
  };

  const ctaState = useMemo(() => {
    return (planId: PlanId) => {
      const plan = PLANS.find((p) => p.id === planId)!;
      if (planId === 'domain' || plan.comingSoon) {
        return { disabled: true, label: 'Coming soon…', to: null as string | null };
      }
      if (planId === 'free') {
        if (isLoggedIn) {
          return {
            disabled: true,
            label: currentPlan === 'free' ? 'Current plan' : 'Included',
            to: null as string | null,
          };
        }
        return {
          disabled: false,
          label: plan.cta,
          to: '/register?plan=free',
        };
      }
      if (isLoggedIn) {
        const due = previewUpgradeDue({
          currentPlan: currentPlan || 'free',
          targetPlan: planId,
          billing,
          currency,
          currentBilling: user?.planBilling,
          currentCurrency: user?.planCurrency,
        });
        if (!due.ok) {
          return { disabled: true, label: due.reason || 'Unavailable', to: null };
        }
        return {
          disabled: false,
          label: due.isUpgrade
            ? `Upgrade · ${formatMoney(due.amountMajor, currency)}`
            : `Get ${plan.name}`,
          to: null,
        };
      }
      return {
        disabled: false,
        label: plan.cta,
        to: null,
      };
    };
  }, [currentPlan, isLoggedIn, billing, currency, user?.planBilling, user?.planCurrency]);

  const savingsHint =
    currency === 'usd'
      ? 'Pro yearly ≈ $0.83/mo · Premium yearly ≈ $1.67/mo'
      : 'Pro yearly ≈ ₹70/mo · Premium yearly ≈ ₹141/mo';

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
          className="max-w-2xl"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
              Pricing
            </p>
            {isLoggedIn && cartItems > 0 ? (
              <Link
                to={cartPath}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0066FF]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#0066FF] hover:bg-[#0066FF]/15"
              >
                <ShoppingCart className="h-3 w-3" />
                Cart ({cartItems})
              </Link>
            ) : null}
          </div>
          <h1 className="font-display text-4xl text-primary sm:text-5xl">
            Start free. Go live when you&apos;re ready.
          </h1>
          <p className="mt-3 text-base text-subtle sm:text-lg">
            Free, Pro, and Premium — upgrade anytime by paying only the remaining amount. Custom
            domain is coming later (not upgradeable yet).
          </p>
        </motion.div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-muted/70 p-1 dark:bg-muted/40" role="group" aria-label="Billing period">
            <button
              type="button"
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                billing === 'monthly'
                  ? 'bg-elevated text-[#0066FF] shadow-sm ring-1 ring-[#0066FF]/20'
                  : 'text-secondary hover:text-primary'
              )}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                billing === 'yearly'
                  ? 'bg-elevated text-[#0066FF] shadow-sm ring-1 ring-[#0066FF]/20'
                  : 'text-secondary hover:text-primary'
              )}
              onClick={() => setBilling('yearly')}
            >
              Yearly
            </button>
          </div>

          <div className="inline-flex rounded-xl bg-muted/70 p-1 dark:bg-muted/40" role="group" aria-label="Currency">
            <button
              type="button"
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                currency === 'usd'
                  ? 'bg-elevated text-[#0066FF] shadow-sm ring-1 ring-[#0066FF]/20'
                  : 'text-secondary hover:text-primary'
              )}
              onClick={() => setCurrencyPersist('usd')}
            >
              USD $
            </button>
            <button
              type="button"
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                currency === 'inr'
                  ? 'bg-elevated text-[#0066FF] shadow-sm ring-1 ring-[#0066FF]/20'
                  : 'text-secondary hover:text-primary'
              )}
              onClick={() => setCurrencyPersist('inr')}
            >
              INR ₹
            </button>
          </div>

          <p className="flex items-start gap-1.5 text-xs text-subtle">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0066FF]" />
            {savingsHint}
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" style={{ perspective: 1400 }}>
          {PLANS.map((plan, i) => {
            const cta = ctaState(plan.id);
            const { price, note, equivalent } = formatPlanPrice(plan, currency, billing);
            const paid = isPaidPlan(plan.id) && !plan.comingSoon;

            return (
              <motion.div
                key={plan.id}
                initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.06, ease }}
                className="h-full"
              >
                <GlassTiltCard
                  className={cn(
                    'flex h-full flex-col',
                    plan.highlighted &&
                      'ring-1 ring-[#0066FF]/35 shadow-[0_0_40px_-16px_rgb(0_102_255/0.45)]',
                    plan.comingSoon && 'opacity-95'
                  )}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {plan.highlighted && (
                      <span className="w-fit rounded-full bg-[#0066FF]/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0066FF]">
                        Popular
                      </span>
                    )}
                    {plan.comingSoon && (
                      <span className="w-fit rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-subtle">
                        Coming soon
                      </span>
                    )}
                    {currentPlan === plan.id && (
                      <span className="w-fit rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                        Your plan
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-primary">{plan.name}</h2>
                  <p className="mt-1 text-sm text-subtle">{plan.description}</p>
                  <p className="mt-4">
                    <span className="text-3xl font-bold tracking-tight text-primary">{price}</span>
                    <span className="ml-1 text-sm text-subtle">{note}</span>
                  </p>
                  {equivalent && plan.id !== 'free' ? (
                    <p className="mt-0.5 text-[11px] text-subtle">{equivalent}</p>
                  ) : null}
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
                    {cta.disabled ? (
                      <Button className="home-cta-secondary h-11 w-full" variant="outline" disabled>
                        {cta.label}
                      </Button>
                    ) : paid ? (
                      <Button
                        className={cn(
                          'w-full',
                          plan.highlighted
                            ? 'home-cta-primary h-11 border-0 hover:bg-transparent'
                            : 'home-cta-secondary h-11'
                        )}
                        variant={plan.highlighted ? 'default' : 'outline'}
                        onClick={() => startPaidPlan(plan.id as PaidPlanId)}
                      >
                        {cta.label}
                      </Button>
                    ) : (
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
                        <Link to={cta.to || '/dashboard'}>{cta.label}</Link>
                      </Button>
                    )}
                  </MagneticCta>
                </GlassTiltCard>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-[#0066FF]/12 bg-elevated/70 p-5 text-sm text-secondary backdrop-blur-sm">
          <p className="font-semibold text-primary">Free tier limits</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>One portfolio per account — draft / preview only (not publicly published).</li>
            <li>Resume import works once; after a successful parse the button stays disabled.</li>
            <li>Upgrade to Pro (2 folios) or Premium (5 folios) to publish on a subdomain.</li>
            <li>Cancel checkout anytime — the plan stays in your cart until you pay.</li>
          </ul>
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        intent={checkoutIntent}
        onOpenChange={setCheckoutOpen}
        onSavedToCart={() => setCartItems(cartCount())}
        onPaid={async () => {
          setCartItems(cartCount());
          await refreshUser();
        }}
      />
    </main>
  );
}
