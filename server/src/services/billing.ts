import Stripe from 'stripe';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { User } from '../models/index.js';
import { PaymentOrder, type IPaymentOrder } from '../models/PaymentOrder.js';
import {
  isPaidPlanId,
  PLAN_PRICES,
  resolveCheckoutAmount,
  type BillingInterval,
  type PaidPlanId,
  type PricingCurrency,
} from '../lib/plans.js';
import { AppError } from '../utils/errors.js';
import { notifyPaymentReceipt } from './emailNotify.js';
import { buildPaymentReceipt } from './receipt.js';

let stripeClient: Stripe | null = null;
let razorpayClient: InstanceType<typeof Razorpay> | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new AppError('Stripe is not configured (STRIPE_SECRET_KEY)', 503);
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function getRazorpay(): InstanceType<typeof Razorpay> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new AppError('Razorpay is not configured (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)', 503);
  }
  if (!razorpayClient) {
    razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }
  return razorpayClient;
}

export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) throw new AppError('Razorpay is not configured', 503);
  return keyId;
}

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function parseCheckoutInput(body: unknown): {
  planId: PaidPlanId;
  billing: BillingInterval;
  currency: PricingCurrency;
} {
  if (!body || typeof body !== 'object') throw new AppError('Invalid body', 400);
  const { planId, billing, currency } = body as Record<string, unknown>;
  if (!isPaidPlanId(planId)) throw new AppError('Invalid plan', 400);
  if (planId === 'domain' || PLAN_PRICES[planId].comingSoon) {
    throw new AppError('Custom domain cannot be purchased yet', 400);
  }
  if (billing !== 'monthly' && billing !== 'yearly') {
    throw new AppError('Invalid billing interval', 400);
  }
  if (currency !== 'usd' && currency !== 'inr') {
    throw new AppError('Invalid currency', 400);
  }
  return { planId, billing, currency };
}

export async function activatePlanFromOrder(order: IPaymentOrder) {
  if (order.status === 'paid') return;

  order.status = 'paid';
  order.paidAt = new Date();
  await order.save();

  await User.findByIdAndUpdate(order.userId, {
    $set: {
      plan: order.planId,
      planBilling: order.billing,
      planCurrency: order.currency,
      planActivatedAt: new Date(),
    },
    $pull: { cart: { planId: order.planId } },
  });

  // Fire-and-forget receipt (webhook or console). Never block payment success.
  void (async () => {
    try {
      const user = await User.findById(order.userId).select('email name');
      if (!user?.email) return;
      const receipt = buildPaymentReceipt({
        order,
        payerEmail: user.email,
        payerName: user.name,
      });
      const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
      await notifyPaymentReceipt({
        to: user.email,
        payerName: receipt.payerName,
        orderId: receipt.orderId,
        planName: receipt.planName,
        billing: receipt.billing,
        amountFormatted: receipt.amountFormatted,
        currency: receipt.currency,
        paidAt: receipt.paidAt,
        provider: receipt.provider,
        paymentReference: receipt.paymentReference,
        receiptUrl: `${clientUrl}/dashboard/account?receipt=${receipt.orderId}`,
      });
    } catch (err) {
      console.error('[receipt-email] notify failed', err);
    }
  })();
}

export async function fulfillStripeSession(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const order = await PaymentOrder.findById(orderId);
  if (!order) return;
  if (order.status === 'paid') return;

  if (session.payment_intent && typeof session.payment_intent === 'string') {
    order.stripePaymentIntentId = session.payment_intent;
  }
  await activatePlanFromOrder(order);
}

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const payload = `${params.orderId}|${params.paymentId}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.signature));
  } catch {
    return false;
  }
}

export { resolveCheckoutAmount };
