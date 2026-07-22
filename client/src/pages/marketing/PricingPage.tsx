import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Info, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { billingApi } from '@/api';
import {
  PLANS,
  PLAN_RANK,
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
  const [showUpgrades, setShowUpgrades] = useState(false);
  const currentPlan = user?.role === 'user' ? normalizePlan(user.plan) : null;
  const isLoggedIn = user?.role === 'user';
  const hasPaidPlan = Boolean(isLoggedIn && currentPlan && currentPlan !== 'free');

  const upgradePlans = useMemo(() => {
    if (!currentPlan || currentPlan === 'free') return [];
    return PLANS.filter(
      (p) =>
        !p.comingSoon &&
        isPaidPlan(p.id) &&
        PLAN_RANK[p.id] > PLAN_RANK[currentPlan]
    );
  }, [currentPlan]);

  useEffect(() => subscribeCart(() => setCartItems(cartCount())), []);

  useEffect(() => {
    if (searchParams.get('upgrade') === '1' && hasPaidPlan && upgradePlans.length > 0) {
      setShowUpgrades(true);
    }
  }, [searchParams, hasPaidPlan, upgradePlans.length]);

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
        return {
          disabled: true,
          label: 'Coming soon…',
          hint: null as string | null,
          to: null as string | null,
          kind: 'soon' as const,
        };
      }
      if (planId === 'free') {
        if (isLoggedIn) {
          const isCurrent = currentPlan === 'free';
          return {
            disabled: true,
            label: isCurrent ? 'Current plan' : 'Included in your plan',
            hint: null as string | null,
            to: null as string | null,
            kind: isCurrent ? ('current' as const) : ('included' as const),
          };
        }
        return {
          disabled: false,
          label: plan.cta,
          hint: null as string | null,
          to: '/register?plan=free',
          kind: 'action' as const,
        };
      }
      if (isLoggedIn) {
        if (currentPlan === planId) {
          return {
            disabled: true,
            label: 'Current plan',
            hint: null as string | null,
            to: null as string | null,
            kind: 'current' as const,
          };
        }
        const due = previewUpgradeDue({
          currentPlan: currentPlan || 'free',
          targetPlan: planId,
          billing,
          currency,
          currentBilling: user?.planBilling,
          currentCurrency: user?.planCurrency,
        });
        if (!due.ok) {
          return {
            disabled: true,
            label: due.reason || 'Unavailable',
            hint: null as string | null,
            to: null as string | null,
            kind: 'blocked' as const,
          };
        }
        return {
          disabled: false,
          label: due.isUpgrade
            ? `Pay ${formatMoney(due.amountMajor, currency)} remaining`
            : `Get ${plan.name}`,
          hint: due.isUpgrade
            ? `Credit applied from ${PLANS.find((p) => p.id === currentPlan)?.name ?? 'your plan'}`
            : null,
          to: null as string | null,
          kind: 'action' as const,
        };
      }
      return {
        disabled: false,
        label: plan.cta,
        hint: null as string | null,
        to: null as string | null,
        kind: 'action' as const,
      };
    };
  }, [currentPlan, isLoggedIn, billing, currency, user?.planBilling, user?.planCurrency]);

  const savingsHint =
    currency === 'usd'
      ? 'Pro yearly ≈ $0.83/mo · Premium yearly ≈ $1.67/mo'
      : 'Pro yearly ≈ ₹70/mo · Premium yearly ≈ ₹141/mo';

  const currentPlanDef = currentPlan ? PLANS.find((p) => p.id === currentPlan) : null;
  const currentPrice = currentPlanDef
    ? formatPlanPrice(currentPlanDef, currency, billing)
    : null;

  const catalogPlans = hasPaidPlan
    ? showUpgrades
      ? upgradePlans
      : []
    : PLANS;

  const tipTitle = hasPaidPlan ? 'Your plan' : 'Free tier limits';
  const tipItems =
    currentPlan === 'pro'
      ? [
          'Pro includes 2 live portfolios on a BuildMyFolio subdomain.',
          'Upgrade when you need more — you only pay the remaining difference.',
          'Unlimited resume imports and all core themes are unlocked.',
        ]
      : currentPlan === 'premium'
        ? [
            'Premium includes 5 live portfolios on BuildMyFolio subdomains.',
            'Unlimited resume imports and all themes are unlocked.',
            'Custom domain support is coming soon as a separate add-on.',
          ]
        : [
            'One portfolio per account — draft / preview only (not publicly published).',
            'Resume import works once; after a successful parse the button stays disabled.',
            'Upgrade to Pro (2 folios) or Premium (5 folios) to publish on a subdomain.',
            'Cancel checkout anytime — the plan stays in your cart until you pay.',
          ];

  const openUpgradePicker = () => {
    setShowUpgrades(true);
    const next = new URLSearchParams(searchParams);
    next.set('upgrade', '1');
    setSearchParams(next, { replace: true });
  };

  const closeUpgradePicker = () => {
    setShowUpgrades(false);
    const next = new URLSearchParams(searchParams);
    next.delete('upgrade');
    setSearchParams(next, { replace: true });
  };

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
              {hasPaidPlan ? 'Your plan' : 'Pricing'}
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
            {hasPaidPlan
              ? `You’re on ${currentPlanDef?.name ?? 'a plan'}`
              : 'Start free. Go live when you’re ready.'}
          </h1>
          <p className="mt-3 text-base text-subtle sm:text-lg">
            {hasPaidPlan
              ? upgradePlans.length > 0
                ? 'Manage your subscription here. Upgrade only when you need more portfolios.'
                : 'You’re on our highest plan. Custom domain support is coming soon.'
              : 'Free, Pro, and Premium — upgrade anytime by paying only the remaining amount. Custom domain is coming later (not upgradeable yet).'}
          </p>
        </motion.div>

        {hasPaidPlan && currentPlanDef && currentPrice ? (
          <motion.div
            className="mt-8 max-w-xl rounded-2xl border border-emerald-500/25 bg-elevated/80 p-5 shadow-[0_0_36px_-18px_rgb(16_185_129/0.4)] backdrop-blur-sm sm:p-6"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
                <h2 className="mt-2 text-2xl font-semibold text-primary">{currentPlanDef.name}</h2>
                <p className="mt-1 text-sm text-subtle">{currentPlanDef.description}</p>
                <p className="mt-3">
                  <span className="text-3xl font-bold tracking-tight text-primary">
                    {currentPrice.price}
                  </span>
                  <span className="ml-1 text-sm text-subtle">{currentPrice.note}</span>
                </p>
                {user?.planBilling ? (
                  <p className="mt-1 text-xs text-subtle">
                    Billed {user.planBilling === 'yearly' ? 'yearly' : 'monthly'}
                    {user.planCurrency ? ` · ${user.planCurrency.toUpperCase()}` : ''}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                {upgradePlans.length > 0 ? (
                  showUpgrades ? (
                    <Button variant="outline" className="home-cta-secondary h-10" onClick={closeUpgradePicker}>
                      Hide upgrades
                    </Button>
                  ) : (
                    <Button
                      className="home-cta-primary h-10 border-0 hover:bg-transparent"
                      onClick={openUpgradePicker}
                    >
                      Upgrade
                    </Button>
                  )
                ) : (
                  <span className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-xs font-medium text-secondary">
                    Highest plan
                  </span>
                )}
              </div>
            </div>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {currentPlanDef.features.slice(0, 4).map((f) => (
                <li key={f} className="flex gap-2 text-sm text-secondary">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}

        {(!hasPaidPlan || showUpgrades) && (
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {showUpgrades && hasPaidPlan ? (
                <p className="w-full text-sm font-medium text-primary">Choose an upgrade</p>
              ) : null}
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

            <div
              className={cn(
                'mt-8 grid gap-5',
                catalogPlans.length === 1
                  ? 'max-w-md sm:grid-cols-1'
                  : catalogPlans.length === 2
                    ? 'sm:grid-cols-2 max-w-3xl'
                    : 'sm:grid-cols-2 xl:grid-cols-4'
              )}
              style={{ perspective: 1400 }}
            >
              {catalogPlans.map((plan, i) => {
                const cta = ctaState(plan.id);
                const { price, note, equivalent } = formatPlanPrice(plan, currency, billing);
                const paid = isPaidPlan(plan.id) && !plan.comingSoon;
                const isCurrent = currentPlan === plan.id;
                const showPopular = Boolean(plan.highlighted) && !isCurrent && !hasPaidPlan;

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
                        showPopular &&
                          'ring-1 ring-[#0066FF]/35 shadow-[0_0_40px_-16px_rgb(0_102_255/0.45)]',
                        hasPaidPlan &&
                          'ring-1 ring-[#0066FF]/30 shadow-[0_0_36px_-16px_rgb(0_102_255/0.35)]',
                        plan.comingSoon && 'opacity-95'
                      )}
                    >
                      <div className="mb-3 flex min-h-[22px] flex-wrap items-center gap-2">
                        {showPopular ? (
                          <span className="w-fit rounded-full bg-[#0066FF]/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0066FF]">
                            Popular
                          </span>
                        ) : plan.comingSoon ? (
                          <span className="w-fit rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-subtle">
                            Coming soon
                          </span>
                        ) : hasPaidPlan ? (
                          <span className="w-fit rounded-full bg-[#0066FF]/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#0066FF]">
                            Upgrade
                          </span>
                        ) : null}
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
                      <div className="mt-8 w-full">
                        <MagneticCta className="w-full">
                          {cta.disabled ? (
                            <Button
                              className={cn(
                                'h-11 w-full disabled:opacity-100',
                                cta.kind === 'current'
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300'
                                  : 'border-border/80 bg-muted/50 text-secondary'
                              )}
                              variant="outline"
                              disabled
                            >
                              {cta.label}
                            </Button>
                          ) : paid ? (
                            <Button
                              className="home-cta-primary h-11 w-full border-0 hover:bg-transparent"
                              onClick={() => startPaidPlan(plan.id as PaidPlanId)}
                            >
                              {cta.label}
                            </Button>
                          ) : (
                            <Button
                              className={cn(
                                'w-full',
                                showPopular
                                  ? 'home-cta-primary h-11 border-0 hover:bg-transparent'
                                  : 'home-cta-secondary h-11'
                              )}
                              variant={showPopular ? 'default' : 'outline'}
                              asChild
                            >
                              <Link to={cta.to || '/dashboard'}>{cta.label}</Link>
                            </Button>
                          )}
                        </MagneticCta>
                        {cta.hint ? (
                          <p className="mt-2 text-center text-[11px] text-subtle">{cta.hint}</p>
                        ) : null}
                      </div>
                    </GlassTiltCard>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-10 rounded-2xl border border-[#0066FF]/12 bg-elevated/70 p-5 text-sm text-secondary backdrop-blur-sm">
          <p className="font-semibold text-primary">{tipTitle}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {tipItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
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
          setShowUpgrades(false);
          await refreshUser();
        }}
      />
    </main>
  );
}
