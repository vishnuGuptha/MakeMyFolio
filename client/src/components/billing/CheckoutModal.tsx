import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { billingApi } from '@/api';
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
  PUBLIC_CART_PATH,
  removeFromCartByPlanId,
  type CheckoutIntent,
} from '@/lib/planCheckout';
import { loadRazorpayScript, openRazorpayCheckout } from '@/lib/razorpay';
import { errorMessage } from '@/lib/apiError';
import { useAuth } from '@/context/AuthContext';
import { DialogRoot, DialogContent } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

type CheckoutModalProps = {
  open: boolean;
  intent: CheckoutIntent | null;
  onOpenChange: (open: boolean) => void;
  onSavedToCart?: () => void;
  onPaid?: (planId: CheckoutIntent['planId']) => void;
};

export function CheckoutModal({
  open,
  intent,
  onOpenChange,
  onSavedToCart,
  onPaid,
}: CheckoutModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const savedRef = useRef(false);
  const payingRef = useRef(false);
  const [paying, setPaying] = useState(false);
  const [alreadyInCart, setAlreadyInCart] = useState(false);

  const cartHref = `${
    pathname.startsWith('/dashboard') || user?.role === 'user'
      ? DASHBOARD_CART_PATH
      : PUBLIC_CART_PATH
  }?highlight=checkout`;

  useEffect(() => {
    if (open && intent) {
      savedRef.current = false;
      payingRef.current = false;
      setPaying(false);
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
  const currencyLabel = intent.currency === 'usd' ? 'USD' : 'INR';
  const payLabel = due?.ok
    ? due.isUpgrade
      ? `Pay ${formatMoney(due.amountMajor, intent.currency)} remaining`
      : `Pay ${formatMoney(due.amountMajor, intent.currency)}`
    : `Pay ${price}`;

  const closeOnly = () => {
    savedRef.current = true;
    clearCheckoutIntent();
    onOpenChange(false);
  };

  const saveToCartAndClose = () => {
    if (payingRef.current) {
      onOpenChange(false);
      return;
    }
    if (alreadyInCart) {
      closeOnly();
      return;
    }
    if (!savedRef.current) {
      savedRef.current = true;
      addToCart(intent);
      clearCheckoutIntent();
      toast.message('Added to cart', {
        description: `${plan.name} (${billingLabel}) is added to your cart`,
        action: {
          label: 'View',
          onClick: () => navigate(cartHref),
        },
      });
      onSavedToCart?.();
    }
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && open) {
      if (payingRef.current) return;
      saveToCartAndClose();
      return;
    }
    onOpenChange(next);
  };

  const finishPaid = (planId: CheckoutIntent['planId']) => {
    payingRef.current = false;
    setPaying(false);
    savedRef.current = true;
    removeFromCartByPlanId(planId);
    clearCheckoutIntent();
    onOpenChange(false);
    onPaid?.(planId);
  };

  const handlePay = async () => {
    if (paying) return;
    if (due && !due.ok) {
      toast.message(due.reason || 'Unavailable');
      return;
    }
    setPaying(true);
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

      await loadRazorpayScript();
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
          try {
            await billingApi.verifyRazorpay({
              orderId: result.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success(`${plan.name} unlocked`, {
              description: 'Your plan is active — publish when you are ready.',
            });
            finishPaid(intent.planId);
          } catch (err) {
            payingRef.current = false;
            setPaying(false);
            toast.error(errorMessage(err, 'Payment verification failed'));
          }
        },
        modal: {
          ondismiss: () => {
            payingRef.current = false;
            setPaying(false);
            if (alreadyInCart) {
              clearCheckoutIntent();
              onOpenChange(false);
              return;
            }
            toast.message('Payment cancelled', {
              description: 'We kept this plan in your cart.',
            });
            if (!savedRef.current) {
              savedRef.current = true;
              addToCart(intent);
              clearCheckoutIntent();
              onSavedToCart?.();
            }
            onOpenChange(false);
          },
        },
      });
    } catch (err) {
      payingRef.current = false;
      setPaying(false);
      toast.error(errorMessage(err, 'Could not start checkout'));
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogContent title="Checkout" className="max-w-md">
        <div className="space-y-4">
          <div className="rounded-xl border border-[#0066FF]/15 bg-muted/40 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0066FF]">
              {plan.name} · {billingLabel} · {currencyLabel}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-primary">
              {price}
              <span className="ml-1 text-sm font-normal text-subtle">{note}</span>
            </p>
            {due?.ok && due.isUpgrade ? (
              <div className="mt-2 space-y-0.5 text-xs text-secondary">
                <p>
                  List {formatMoney(due.listMajor, intent.currency)} − credit{' '}
                  {formatMoney(due.creditMajor, intent.currency)}
                </p>
                <p className="font-semibold text-primary">
                  Due now {formatMoney(due.amountMajor, intent.currency)}
                </p>
              </div>
            ) : null}
            <p className="mt-2 text-sm text-secondary">{plan.description}</p>
          </div>

          <p className="text-xs text-subtle">
            {alreadyInCart
              ? 'This plan is already in your cart.'
              : intent.currency === 'usd'
                ? 'Secure card checkout. Cancel anytime — we’ll save this plan to your cart.'
                : 'Pay with UPI, card, or netbanking. Cancel anytime — we’ll save this plan to your cart.'}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button
              className="home-cta-primary h-10 flex-1 border-0 hover:bg-transparent"
              loading={paying}
              disabled={due ? !due.ok : false}
              onClick={handlePay}
            >
              {paying ? 'Starting…' : payLabel}
            </Button>
            <Button
              variant="outline"
              className="h-10 flex-1"
              disabled={paying}
              onClick={(e) => {
                e.preventDefault();
                saveToCartAndClose();
              }}
            >
              {alreadyInCart ? 'Cancel' : 'Add to cart'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
