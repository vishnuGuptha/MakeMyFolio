import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy, ExternalLink, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { billingApi, userApi } from '@/api';
import {
  getPlan,
  formatPlanPrice,
  formatMoney,
  previewUpgradeDue,
  normalizePlanId,
} from '@/lib/plans';
import {
  addToCart,
  clearCheckoutIntent,
  DASHBOARD_CART_PATH,
  isInCart,
  removeFromCartByPlanId,
  type CheckoutIntent,
} from '@/lib/planCheckout';
import {
  autoPublishActiveFolio,
  linkedInShareUrl,
  whatsappShareUrl,
  type LiveShareInfo,
} from '@/lib/autoPublish';
import { openPaymentReceipt } from '@/lib/openReceipt';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay';
import { errorMessage } from '@/lib/apiError';
import { useAuth } from '@/context/AuthContext';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { getPublicPortfolioLabel } from '@/lib/utils';
import { DialogRoot, DialogContent } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

type PayPhase =
  | 'idle'
  | 'creating'
  | 'opening'
  | 'verifying'
  | 'going-live'
  | 'success'
  | 'failed';

type CheckoutModalProps = {
  open: boolean;
  intent: CheckoutIntent | null;
  onOpenChange: (open: boolean) => void;
  onSavedToCart?: () => void;
  onPaid?: (planId: CheckoutIntent['planId']) => void;
  /** After pay, publish active folio and show share sheet (default true). */
  autoPublishOnSuccess?: boolean;
};

export function CheckoutModal({
  open,
  intent,
  onOpenChange,
  onSavedToCart,
  onPaid,
  autoPublishOnSuccess = true,
}: CheckoutModalProps) {
  const { user, refreshUser } = useAuth();
  const { activeProfile, refreshProfiles } = useAdminProfile();
  const navigate = useNavigate();
  const payingRef = useRef(false);
  const [phase, setPhase] = useState<PayPhase>('idle');
  const [failMessage, setFailMessage] = useState<string | null>(null);
  const [alreadyInCart, setAlreadyInCart] = useState(false);
  const [handedOff, setHandedOff] = useState(false);
  const [paidPlanId, setPaidPlanId] = useState<CheckoutIntent['planId'] | null>(null);
  const [receiptOrderId, setReceiptOrderId] = useState<string | null>(null);
  const [liveShare, setLiveShare] = useState<LiveShareInfo | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);

  const cartHref = `${DASHBOARD_CART_PATH}?highlight=checkout`;

  useEffect(() => {
    if (open && intent) {
      payingRef.current = false;
      setPhase('idle');
      setFailMessage(null);
      setHandedOff(false);
      setPaidPlanId(null);
      setLiveShare(null);
      setLiveError(null);
      setAlreadyInCart(isInCart(intent.planId));
    }
  }, [open, intent?.planId, intent?.billing, intent?.currency]);

  const due = useMemo(() => {
    if (!intent) return null;
    return previewUpgradeDue({
      currentPlan: user?.role === 'user' ? normalizePlanId(user.plan) : 'free',
      targetPlan: intent.planId,
      billing: intent.billing,
      currency: intent.currency,
      currentBilling: user?.planBilling,
      currentCurrency: user?.planCurrency,
    });
  }, [intent, user]);

  if (!intent) return null;

  const plan = getPlan(intent.planId);
  const { price, note } = formatPlanPrice(plan, intent.currency, intent.billing);
  const billingLabel = intent.billing === 'yearly' ? 'Yearly' : 'Monthly';
  const payLabel = due?.ok ? due.dueLabel : `Pay ${price}`;
  const busy =
    phase === 'creating' ||
    phase === 'opening' ||
    phase === 'verifying' ||
    phase === 'going-live';
  const benefitLine =
    intent.planId === 'premium'
      ? 'Unlock 5 live portfolios'
      : intent.planId === 'pro'
        ? 'Unlock 2 live portfolios'
        : plan.description;

  const closeOnly = () => {
    clearCheckoutIntent();
    payingRef.current = false;
    setPhase('idle');
    setHandedOff(false);
    setLiveShare(null);
    setLiveError(null);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && open) {
      if (payingRef.current || phase === 'success' || phase === 'going-live') return;
      closeOnly();
      return;
    }
    onOpenChange(next);
  };

  const addToCartExplicit = () => {
    if (busy) return;
    if (!alreadyInCart) {
      addToCart(intent);
      setAlreadyInCart(true);
      toast.message('Saved for later', {
        description: `${plan.name} (${billingLabel}) is in your saved plans`,
        action: {
          label: 'View',
          onClick: () => navigate(cartHref),
        },
      });
      onSavedToCart?.();
    }
    clearCheckoutIntent();
    onOpenChange(false);
  };

  const finishPaid = async (planId: CheckoutIntent['planId']) => {
    payingRef.current = false;
    removeFromCartByPlanId(planId);
    clearCheckoutIntent();
    setPaidPlanId(planId);
    setHandedOff(false);
    setLiveShare(null);
    setLiveError(null);

    try {
      await refreshUser();
    } catch {
      /* ignore */
    }

    if (autoPublishOnSuccess) {
      setPhase('going-live');
      try {
        await refreshProfiles();
        const profiles = await userApi.getProfiles();
        const preferredId = activeProfile?._id;
        const target =
          (preferredId && profiles.find((p) => p._id === preferredId)) ||
          profiles.find((p) => p.isDefault) ||
          profiles[0] ||
          null;
        const live = await autoPublishActiveFolio(target);
        setLiveShare(live);
        if (live?.publishedNow) {
          await refreshProfiles().catch(() => undefined);
        }
      } catch (err) {
        setLiveError(errorMessage(err, 'Plan unlocked — publish from the dashboard when ready.'));
      }
    }

    setPhase('success');
    onPaid?.(planId);
  };

  const handlePay = async () => {
    if (busy) return;
    if (due && !due.ok) {
      toast.message(due.reason || 'Unavailable');
      return;
    }
    setFailMessage(null);
    setPhase('creating');
    payingRef.current = true;
    try {
      const result = await billingApi.checkout({
        planId: intent.planId,
        billing: intent.billing,
        currency: intent.currency,
      });

      if (result.provider === 'stripe') {
        window.location.assign(result.url);
        return;
      }

      setPhase('opening');
      await loadRazorpayScript();
      setHandedOff(true);
      openRazorpayCheckout({
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        name: result.name,
        description: result.description,
        order_id: result.razorpayOrderId,
        prefill: result.prefill,
        theme: { color: '#0066FF' },
        handler: async (response) => {
          setPhase('verifying');
          setHandedOff(false);
          try {
            await billingApi.verifyRazorpay({
              orderId: result.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setReceiptOrderId(result.orderId);
            await finishPaid(intent.planId);
          } catch (err) {
            payingRef.current = false;
            setPhase('failed');
            setFailMessage(errorMessage(err, 'Payment verification failed'));
          }
        },
        modal: {
          ondismiss: () => {
            payingRef.current = false;
            setPhase('idle');
            setHandedOff(false);
            toast.message('Payment cancelled', {
              description: 'Nothing was charged. You can pay now or save for later.',
            });
          },
        },
        onPaymentFailed: (response) => {
          payingRef.current = false;
          setPhase('failed');
          setHandedOff(false);
          setFailMessage(
            response.error?.description ||
              'The payment could not be completed. Please try again.'
          );
        },
      });
    } catch (err) {
      payingRef.current = false;
      setPhase('failed');
      setHandedOff(false);
      setFailMessage(errorMessage(err, 'Could not start checkout'));
    }
  };

  const phaseLabel =
    phase === 'creating'
      ? 'Creating order…'
      : phase === 'opening'
        ? 'Opening secure checkout…'
        : phase === 'verifying'
          ? 'Confirming payment…'
          : phase === 'going-live'
            ? 'Publishing your folio…'
            : payLabel;

  const copyLiveLink = async () => {
    if (!liveShare?.publicUrl) return;
    try {
      await navigator.clipboard.writeText(liveShare.publicUrl);
      toast.success('Live link copied');
    } catch {
      toast.error('Could not copy — select the link manually');
    }
  };

  if (phase === 'going-live') {
    return (
      <DialogRoot open={open} onOpenChange={() => undefined}>
        <DialogContent title="Almost there" className="max-w-md">
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
            <p className="text-sm font-medium text-primary">Publishing your portfolio…</p>
            <p className="text-xs text-subtle">Unlocking your live link.</p>
          </div>
        </DialogContent>
      </DialogRoot>
    );
  }

  if (phase === 'success') {
    const unlocked = paidPlanId ? getPlan(paidPlanId).name : plan.name;
    const folioName = activeProfile?.displayName;
    const isLive = Boolean(liveShare?.publicUrl);

    return (
      <DialogRoot open={open} onOpenChange={(next) => !next && closeOnly()}>
        <DialogContent title={isLive ? "You're live" : 'Payment successful'} className="max-w-md">
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-primary">
                {isLive ? 'Your folio is live' : `${unlocked} is active`}
              </p>
              <p className="mt-1 text-sm text-subtle">
                {isLive
                  ? liveShare?.publishedNow
                    ? `${unlocked} unlocked and your portfolio was published.`
                    : `${unlocked} unlocked — your portfolio was already live.`
                  : liveError ||
                    'Your plan is unlocked. Publish a portfolio from the dashboard when ready.'}
              </p>
            </div>

            {isLive && liveShare ? (
              <div className="rounded-xl border border-[#0066FF]/15 bg-muted/40 px-3 py-3 text-left">
                <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">
                  Live link
                </p>
                <p className="mt-1 break-all font-mono text-xs text-primary">
                  {getPublicPortfolioLabel(liveShare.slug)}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="home-cta-primary h-9 border-0 shadow-none"
                    onClick={copyLiveLink}
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy link
                  </Button>
                  <Button size="sm" variant="outline" className="h-9" asChild>
                    <a href={liveShare.publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" className="h-9" asChild>
                    <a
                      href={whatsappShareUrl(liveShare.publicUrl, folioName)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  </Button>
                  <Button size="sm" variant="outline" className="h-9" asChild>
                    <a
                      href={linkedInShareUrl(liveShare.publicUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </a>
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                className="home-cta-primary h-11 flex-1 border-0 font-semibold shadow-none"
                asChild
              >
                <Link to="/dashboard" onClick={closeOnly}>
                  <span>Go to dashboard</span>
                </Link>
              </Button>
              {!isLive ? (
                <Button
                  variant="outline"
                  className="home-cta-secondary h-11 flex-1 font-semibold"
                  asChild
                >
                  <Link to="/dashboard" onClick={closeOnly}>
                    <span>Publish from dashboard</span>
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="home-cta-secondary h-11 flex-1 font-semibold"
                  asChild
                >
                  <Link to="/dashboard/content" onClick={closeOnly}>
                    <span>Edit folio</span>
                  </Link>
                </Button>
              )}
            </div>
            {receiptOrderId ? (
              <button
                type="button"
                className="text-xs font-medium text-[#0066FF] hover:underline"
                onClick={() => void openPaymentReceipt(receiptOrderId)}
              >
                View payment receipt
              </button>
            ) : (
              <button
                type="button"
                className="text-xs font-medium text-[#0066FF] hover:underline"
                onClick={() => {
                  closeOnly();
                  navigate('/dashboard/account');
                }}
              >
                View billing history
              </button>
            )}
          </div>
        </DialogContent>
      </DialogRoot>
    );
  }

  return (
    <DialogRoot open={open && !handedOff} onOpenChange={handleOpenChange}>
      <DialogContent title="Checkout" className="max-w-md sm:max-w-md w-[calc(100%-1.5rem)]">
        <div className="space-y-4">
          <div className="rounded-xl border border-[#0066FF]/15 bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-subtle">
              <Lock className="h-3 w-3 text-[#0066FF]" />
              Secure checkout · {currencyLabelFor(intent.currency)}
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[#0066FF]">
              {plan.name} · {billingLabel}
            </p>
            <p className="mt-1 text-sm font-medium text-primary">{benefitLine}</p>
            {due?.ok ? (
              <div className="mt-3 space-y-1 border-t border-border/50 pt-3 text-sm">
                <div className="flex justify-between gap-2 text-secondary">
                  <span>List price</span>
                  <span>{formatMoney(due.listMajor, intent.currency)}</span>
                </div>
                {due.isUpgrade && due.creditMajor > 0 ? (
                  <div className="flex justify-between gap-2 text-emerald-600 dark:text-emerald-400">
                    <span>Credit ({normalizePlanId(user?.plan)})</span>
                    <span>−{formatMoney(due.creditMajor, intent.currency)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between gap-2 font-semibold text-primary">
                  <span>Due now</span>
                  <span>{formatMoney(due.amountMajor, intent.currency)}</span>
                </div>
                {due.noCreditReason ? (
                  <p className="pt-1 text-[11px] text-amber-700 dark:text-amber-300">
                    {due.noCreditReason}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-2xl font-bold tracking-tight text-primary">
                {price}
                <span className="ml-1 text-sm font-normal text-subtle">{note}</span>
              </p>
            )}
          </div>

          <p className="text-xs text-subtle">
            Pay with UPI, cards, or netbanking (INR). Nothing is charged until you complete payment.
          </p>

          {phase === 'failed' && failMessage ? (
            <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
              {failMessage}
            </div>
          ) : null}

          {busy ? (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-secondary">
              <Loader2 className="h-4 w-4 animate-spin text-[#0066FF]" />
              {phaseLabel}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Button
              className="home-cta-primary h-11 w-full border-0 font-semibold shadow-none"
              loading={busy}
              disabled={due ? !due.ok : false}
              onClick={handlePay}
            >
              <span>{phase === 'failed' ? `Retry · ${payLabel}` : phaseLabel}</span>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="home-cta-secondary h-10 flex-1 font-semibold"
                disabled={busy}
                onClick={(e) => {
                  e.preventDefault();
                  addToCartExplicit();
                }}
              >
                <span>{alreadyInCart ? 'Already saved' : 'Save for later'}</span>
              </Button>
              <Button
                variant="ghost"
                className="h-10 flex-1 text-secondary"
                disabled={busy}
                onClick={(e) => {
                  e.preventDefault();
                  closeOnly();
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}

function currencyLabelFor(currency: CheckoutIntent['currency']) {
  return currency === 'usd' ? 'USD' : 'INR';
}
