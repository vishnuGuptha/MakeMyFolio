import mongoose, { Document, Schema, Types } from 'mongoose';
import type { BillingInterval, PaidPlanId, PricingCurrency } from '../lib/plans.js';

export type PaymentProvider = 'stripe' | 'razorpay';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface IPaymentOrder extends Document {
  userId: Types.ObjectId;
  planId: PaidPlanId;
  billing: BillingInterval;
  currency: PricingCurrency;
  /** Amount in minor units (cents / paise) */
  amountMinor: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  metadata?: Record<string, string>;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentOrderSchema = new Schema<IPaymentOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    planId: { type: String, enum: ['pro', 'premium', 'domain'], required: true },
    billing: { type: String, enum: ['monthly', 'yearly'], required: true },
    currency: { type: String, enum: ['usd', 'inr'], required: true },
    amountMinor: { type: Number, required: true },
    provider: { type: String, enum: ['stripe', 'razorpay'], required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    stripeSessionId: { type: String, default: null, index: true },
    stripePaymentIntentId: { type: String, default: null },
    razorpayOrderId: { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    metadata: { type: Map, of: String, default: undefined },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const PaymentOrder = mongoose.model<IPaymentOrder>('PaymentOrder', paymentOrderSchema);
