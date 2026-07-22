import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getPlan,
  formatPlanPrice,
  formatMoney,
  previewUpgradeDue,
  PLAN_RANK,
  normalizePlanId,
  resolveCheckoutCurrency,
  USD_CHECKOUT_ENABLED,
  type BillingInterval,
  type PricingCurrency,
} from '@/lib/plans';
import {
  buildAuthPath,
  DASHBOARD_PRICING_PATH,
  markOpenCheckoutAfterAuth,
  PRICING_CHECKOUT_NEXT,
  PUBLIC_PRICING_PATH,
  readCart,
  removeFromCart,
  setCheckoutIntent,
  subscribeCart,
  updateCartItem,
  type CartItem,
  type CheckoutIntent,
  type PaidPlanId,
} from '@/lib/planCheckout';
import { useAuth } from '@/context/AuthContext';
import { CheckoutModal } from '@/components/billing/CheckoutModal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

function ToggleGroup<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string; disabled?: boolean; badge?: string }[];
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      className="inline-flex rounded-lg bg-muted/70 p-0.5 dark:bg-muted/40"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          title={opt.disabled ? `${opt.label} coming soon` : undefined}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors',
            opt.disabled
              ? 'cursor-not-allowed text-subtle opacity-70'
              : value === opt.value
                ? 'bg-elevated text-[#0066FF] shadow-sm ring-1 ring-[#0066FF]/20'
                : 'text-secondary hover:text-primary'
          )}
          onClick={() => {
            if (opt.disabled) return;
            onChange(opt.value);
          }}
        >
          {opt.label}
          {opt.badge ? (
            <span className="rounded-full bg-muted px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-subtle">
              {opt.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

export default function CartPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const pricingPath = pathname.startsWith('/dashboard')
    ? DASHBOARD_PRICING_PATH
    : PUBLIC_PRICING_PATH;
  const [items, setItems] = useState<CartItem[]>(() =>
    readCart().filter((i) => i.planId !== 'domain')
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<CheckoutIntent | null>(null);
  const [open, setOpen] = useState(false);
  const [highlightCheckout, setHighlightCheckout] = useState(false);

  const currentPlan = user?.role === 'user' ? normalizePlanId(user.plan) : 'free';

  useEffect(() => {
    return subscribeCart(() => {
      const next = readCart().filter((i) => i.planId !== 'domain');
      setItems(next);
    });
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !items.some((i) => i.id === selectedId)) {
      const highest = [...items].sort(
        (a, b) => PLAN_RANK[b.planId] - PLAN_RANK[a.planId]
      )[0];
      setSelectedId(highest.id);
    }
  }, [items, selectedId]);

  useEffect(() => {
    if (searchParams.get('highlight') !== 'checkout') return;
    setHighlightCheckout(true);
    const t = window.setTimeout(() => {
      document.getElementById('cart-checkout')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 80);
    const clear = window.setTimeout(() => {
      setHighlightCheckout(false);
      const next = new URLSearchParams(searchParams);
      next.delete('highlight');
      setSearchParams(next, { replace: true });
    }, 2800);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(clear);
    };
  }, [searchParams, setSearchParams]);

  const refresh = () => setItems(readCart().filter((i) => i.planId !== 'domain'));

  const selected = items.find((i) => i.id === selectedId) || items[0] || null;

  const duePreview = useMemo(() => {
    if (!selected) return null;
    const currency = resolveCheckoutCurrency(selected.currency);
    return previewUpgradeDue({
      currentPlan,
      targetPlan: selected.planId,
      billing: selected.billing,
      currency,
      currentBilling: user?.planBilling,
      currentCurrency: user?.planCurrency,
    });
  }, [selected, currentPlan, user?.planBilling, user?.planCurrency]);

  const startCheckout = (item: CartItem) => {
    if (item.planId === 'domain') {
      toast.message('Custom domain is not available yet');
      return;
    }
    const currency = resolveCheckoutCurrency(item.currency);
    const preview = previewUpgradeDue({
      currentPlan,
      targetPlan: item.planId,
      billing: item.billing,
      currency,
      currentBilling: user?.planBilling,
      currentCurrency: user?.planCurrency,
    });
    if (!preview.ok) {
      toast.message(preview.reason || 'Cannot checkout this plan');
      return;
    }

    const intent: CheckoutIntent = {
      planId: item.planId as PaidPlanId,
      billing: item.billing,
      currency,
    };
    setCheckoutIntent(intent);
    if (user?.role !== 'user') {
      markOpenCheckoutAfterAuth();
      toast.message('Sign in to checkout', {
        description: 'We’ll bring you back with this plan ready.',
      });
      navigate(buildAuthPath('/login', { next: PRICING_CHECKOUT_NEXT }));
      return;
    }
    setCheckout(intent);
    setOpen(true);
  };

  const patchItem = (id: string, patch: Partial<Pick<CartItem, 'billing' | 'currency'>>) => {
    updateCartItem(id, patch);
    refresh();
  };

  return (
    <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-start gap-3">
        <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0066FF]/12 text-[#0066FF]">
          <ShoppingCart className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-3xl text-primary sm:text-4xl">Cart</h1>
          <p className="mt-1 text-sm text-subtle">
            Free → Pro → Premium. Upgrade by paying only the remaining amount.
            {user?.role === 'user' ? ' Synced to your account.' : ''}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border/70 bg-elevated/60 px-6 py-10 text-center">
          <p className="text-sm text-secondary">Your cart is empty.</p>
          <Button className="mt-4 home-cta-secondary" variant="outline" asChild>
            <Link to={pricingPath}>Browse pricing</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <ul className="space-y-3">
            {items.map((item) => {
              const plan = getPlan(item.planId);
              const { price, note, equivalent } = formatPlanPrice(
                plan,
                resolveCheckoutCurrency(item.currency),
                item.billing
              );
              const isSelected = selected?.id === item.id;
              return (
                <li key={item.id}>
                  <label
                    className={cn(
                      'flex cursor-pointer flex-col gap-3 rounded-2xl border bg-elevated/70 p-4 transition-colors sm:flex-row sm:items-start sm:justify-between',
                      isSelected
                        ? 'border-[#0066FF]/40 ring-1 ring-[#0066FF]/20'
                        : 'border-border/70 hover:border-[#0066FF]/20'
                    )}
                  >
                    <div className="flex min-w-0 flex-1 gap-3">
                      <input
                        type="radio"
                        name="cart-select"
                        className="mt-1.5 accent-[#0066FF]"
                        checked={isSelected}
                        onChange={() => setSelectedId(item.id)}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-primary">{plan.name}</p>
                        <p className="mt-0.5 text-sm text-secondary line-clamp-2">
                          {plan.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <ToggleGroup
                            ariaLabel="Billing period"
                            value={item.billing}
                            onChange={(billing: BillingInterval) =>
                              patchItem(item.id, { billing })
                            }
                            options={[
                              { value: 'monthly', label: 'Monthly' },
                              { value: 'yearly', label: 'Yearly' },
                            ]}
                          />
                          <ToggleGroup
                            ariaLabel="Currency"
                            value={resolveCheckoutCurrency(item.currency)}
                            onChange={(currency: PricingCurrency) => {
                              if (currency === 'usd' && !USD_CHECKOUT_ENABLED) {
                                toast.message('USD payments coming soon', {
                                  description: 'Checkout is available in INR for now.',
                                });
                                return;
                              }
                              patchItem(item.id, { currency });
                            }}
                            options={[
                              { value: 'inr', label: 'INR ₹' },
                              {
                                value: 'usd',
                                label: 'USD $',
                                disabled: !USD_CHECKOUT_ENABLED,
                                badge: USD_CHECKOUT_ENABLED ? undefined : 'Soon',
                              },
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-3 sm:flex-col sm:items-end sm:pl-4">
                      <div className="text-left sm:text-right">
                        <p className="text-xl font-bold tracking-tight text-primary">
                          {price}
                          <span className="ml-1 text-sm font-normal text-subtle">{note}</span>
                        </p>
                        {equivalent ? (
                          <p className="text-[11px] text-subtle">{equivalent}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${plan.name} from cart`}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/15 dark:hover:text-red-300"
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromCart(item.id);
                          refresh();
                          toast.message('Removed from cart');
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>

          <aside
            id="cart-checkout"
            className={cn(
              'rounded-2xl border bg-elevated/90 p-4 sm:p-5 lg:sticky lg:top-20 transition-shadow duration-500',
              highlightCheckout
                ? 'border-[#0066FF] shadow-[0_0_0_3px_rgb(0_102_255/0.25)] ring-2 ring-[#0066FF]/30'
                : 'border-[#0066FF]/15'
            )}
          >
            <p className="text-sm font-semibold text-primary">Order summary</p>
            {selected ? (
              <>
                <div className="mt-3 space-y-2 border-b border-border/60 pb-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-secondary">{getPlan(selected.planId).name}</span>
                    <span className="font-medium text-primary">
                      {formatMoney(
                        duePreview?.listMajor ?? 0,
                        resolveCheckoutCurrency(selected.currency)
                      )}
                    </span>
                  </div>
                  {duePreview?.isUpgrade && duePreview.creditMajor > 0 ? (
                    <div className="flex justify-between gap-2 text-emerald-600 dark:text-emerald-400">
                      <span>Credit ({normalizePlanId(user?.plan)})</span>
                      <span>
                        −
                        {formatMoney(
                          duePreview.creditMajor,
                          resolveCheckoutCurrency(selected.currency)
                        )}
                      </span>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-2 font-semibold text-primary">
                    <span>Due now</span>
                    <span>
                      {formatMoney(
                        duePreview?.amountMajor ?? 0,
                        resolveCheckoutCurrency(selected.currency)
                      )}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-subtle">
                  {duePreview?.ok
                    ? duePreview.isUpgrade
                      ? 'You only pay the difference to upgrade.'
                      : 'Secure checkout · cancel anytime before payment.'
                    : duePreview?.reason}
                </p>
                <Button
                  className={cn(
                    'home-cta-primary mt-4 h-11 w-full border-0 font-semibold shadow-none',
                    highlightCheckout && 'ring-2 ring-[#0066FF]/40 ring-offset-2 ring-offset-elevated'
                  )}
                  disabled={!duePreview?.ok}
                  onClick={() => startCheckout(selected)}
                >
                  <span>{duePreview?.ok ? duePreview.dueLabel : 'Unavailable'}</span>
                </Button>
              </>
            ) : null}
            <Link
              to={pricingPath}
              className="mt-3 block text-center text-xs font-medium text-[#0066FF] hover:underline"
            >
              Browse all plans
            </Link>
          </aside>
        </div>
      )}

      <CheckoutModal
        open={open}
        intent={checkout}
        onOpenChange={setOpen}
        onSavedToCart={refresh}
        onPaid={async () => {
          refresh();
          await refreshUser();
        }}
      />
    </main>
  );
}
