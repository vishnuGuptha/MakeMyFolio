import { Router, type Request, type Response, type NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import type Stripe from 'stripe';
import { AuthRequest, requireUser } from '../middleware/auth.js';
import { User } from '../models/index.js';
import { PaymentOrder } from '../models/PaymentOrder.js';
import {
  activatePlanFromOrder,
  fulfillStripeSession,
  getRazorpay,
  getRazorpayKeyId,
  getStripe,
  parseCheckoutInput,
  razorpayConfigured,
  stripeConfigured,
  verifyRazorpaySignature,
} from '../services/billing.js';
import { normalizePlanId, PLAN_PRICES, resolveUpgradeDue } from '../lib/plans.js';
import { normalizeCartItems } from '../lib/cart.js';
import { AppError } from '../utils/errors.js';

const router = Router();

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many checkout attempts. Try again shortly.' },
});

const CLIENT_URL = () => (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

router.get('/status', (_req, res) => {
  res.json({
    stripe: stripeConfigured(),
    razorpay: razorpayConfigured(),
  });
});

router.get('/cart', requireUser, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.auth!.id).select('cart');
    if (!user) throw new AppError('User not found', 401);
    return res.json({ items: normalizeCartItems(user.cart || []) });
  } catch (err) {
    next(err);
  }
});

router.put('/cart', requireUser, async (req: AuthRequest, res, next) => {
  try {
    const items = normalizeCartItems(req.body?.items);
    const user = await User.findByIdAndUpdate(
      req.auth!.id,
      { $set: { cart: items } },
      { new: true }
    ).select('cart');
    if (!user) throw new AppError('User not found', 401);
    return res.json({ items: normalizeCartItems(user.cart || []) });
  } catch (err) {
    next(err);
  }
});

router.post('/checkout', requireUser, checkoutLimiter, async (req: AuthRequest, res, next) => {
  try {
    const { planId, billing, currency } = parseCheckoutInput(req.body);
    const user = await User.findById(req.auth!.id);
    if (!user) throw new AppError('User not found', 401);

    const due = resolveUpgradeDue({
      currentPlan: normalizePlanId(user.plan),
      targetPlan: planId,
      billing,
      currency,
      currentBilling: user.planBilling,
      currentCurrency: user.planCurrency,
    });

    const { amountMinor, amountMajor, listMajor, creditMajor, isUpgrade, label } = due;
    const planName = PLAN_PRICES[planId].name;

    if (amountMinor <= 0) {
      throw new AppError('Nothing to pay for this upgrade', 400);
    }

    if (currency === 'usd') {
      if (!stripeConfigured()) {
        throw new AppError('Card payments are not available yet. Try again later or switch to INR.', 503);
      }
      const stripe = getStripe();

      const order = await PaymentOrder.create({
        userId: user._id,
        planId,
        billing,
        currency,
        amountMinor,
        provider: 'stripe',
        status: 'pending',
      });

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: user.email,
        client_reference_id: user._id.toString(),
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'usd',
              unit_amount: amountMinor,
              product_data: {
                name: `BuildMyFolio ${planName}`,
                description: isUpgrade
                  ? `${label} — pay remaining $${amountMajor} (list $${listMajor} − credit $${creditMajor})`
                  : `${label} — publish & portfolio limits unlocked`,
              },
            },
          },
        ],
        metadata: {
          orderId: order._id.toString(),
          userId: user._id.toString(),
          planId,
          billing,
          creditMajor: String(creditMajor),
          listMajor: String(listMajor),
        },
        success_url: `${CLIENT_URL()}/dashboard/pricing?payment=success&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${CLIENT_URL()}/dashboard/pricing?payment=cancelled&plan=${planId}`,
      });

      order.stripeSessionId = session.id;
      await order.save();

      if (!session.url) throw new AppError('Failed to create Stripe checkout session', 500);

      return res.json({
        provider: 'stripe' as const,
        orderId: order._id.toString(),
        url: session.url,
        amountMajor,
        listMajor,
        creditMajor,
        isUpgrade,
      });
    }

    if (!razorpayConfigured()) {
      throw new AppError('UPI / card payments are not available yet. Try again later or switch to USD.', 503);
    }
    const rzp = getRazorpay();

    const order = await PaymentOrder.create({
      userId: user._id,
      planId,
      billing,
      currency,
      amountMinor,
      provider: 'razorpay',
      status: 'pending',
    });

    const rzOrder = await rzp.orders.create({
      amount: amountMinor,
      currency: 'INR',
      receipt: order._id.toString().slice(-32),
      notes: {
        orderId: order._id.toString(),
        userId: user._id.toString(),
        planId,
        billing,
        creditMajor: String(creditMajor),
      },
    });

    order.razorpayOrderId = rzOrder.id;
    await order.save();

    return res.json({
      provider: 'razorpay' as const,
      orderId: order._id.toString(),
      keyId: getRazorpayKeyId(),
      razorpayOrderId: rzOrder.id,
      amount: amountMinor,
      currency: 'INR',
      name: `BuildMyFolio ${planName}`,
      description: isUpgrade
        ? `${label} — pay remaining ₹${amountMajor}`
        : label,
      amountMajor,
      listMajor,
      creditMajor,
      isUpgrade,
      prefill: {
        name: user.name || '',
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/razorpay/verify', requireUser, async (req: AuthRequest, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body || {};
    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_signature !== 'string'
    ) {
      throw new AppError('Missing Razorpay payment fields', 400);
    }

    const ok = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
    if (!ok) throw new AppError('Invalid payment signature', 400);

    const order =
      (typeof orderId === 'string' && (await PaymentOrder.findById(orderId))) ||
      (await PaymentOrder.findOne({ razorpayOrderId: razorpay_order_id }));

    if (!order) throw new AppError('Order not found', 404);
    if (order.userId.toString() !== req.auth!.id) throw new AppError('Forbidden', 403);
    if (order.razorpayOrderId !== razorpay_order_id) {
      throw new AppError('Order mismatch', 400);
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await activatePlanFromOrder(order);

    // Drop purchased plan from saved cart
    await User.findByIdAndUpdate(req.auth!.id, {
      $pull: { cart: { planId: order.planId } },
    });

    const user = await User.findById(req.auth!.id).select('plan planBilling planCurrency');
    return res.json({
      ok: true,
      plan: user?.plan,
      billing: user?.planBilling,
      currency: user?.planCurrency,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/stripe/confirm', requireUser, async (req: AuthRequest, res, next) => {
  try {
    const sessionId = req.body?.sessionId;
    if (typeof sessionId !== 'string' || !sessionId) {
      throw new AppError('sessionId required', 400);
    }
    if (!stripeConfigured()) throw new AppError('Stripe is not configured', 503);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.client_reference_id !== req.auth!.id) {
      throw new AppError('Forbidden', 403);
    }
    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      throw new AppError('Payment not completed', 400);
    }

    await fulfillStripeSession(session);

    const orderId = session.metadata?.orderId;
    if (orderId) {
      const order = await PaymentOrder.findById(orderId).select('planId');
      if (order) {
        await User.findByIdAndUpdate(req.auth!.id, {
          $pull: { cart: { planId: order.planId } },
        });
      }
    }

    const user = await User.findById(req.auth!.id).select('plan planBilling planCurrency');
    return res.json({
      ok: true,
      plan: user?.plan,
      billing: user?.planBilling,
      currency: user?.planCurrency,
    });
  } catch (err) {
    next(err);
  }
});

export async function stripeWebhookHandler(req: Request, res: Response, _next?: NextFunction) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[billing] STRIPE_WEBHOOK_SECRET missing — ignoring webhook');
    return res.status(503).json({ error: 'Webhook not configured' });
  }

  const sig = req.headers['stripe-signature'];
  if (!sig || typeof sig !== 'string') {
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid payload';
    console.warn('[billing] Stripe webhook verify failed:', msg);
    return res.status(400).json({ error: `Webhook Error: ${msg}` });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await fulfillStripeSession(session);
    }
    return res.json({ received: true });
  } catch (err) {
    console.error('[billing] Stripe webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}

export default router;
