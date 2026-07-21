import {
  isPaidPlanId,
  type BillingInterval,
  type PaidPlanId,
  type PricingCurrency,
} from '../lib/plans.js';

export type CartItemPayload = {
  id: string;
  planId: PaidPlanId;
  billing: BillingInterval;
  currency: PricingCurrency;
  addedAt: number;
};

export function normalizeCartItems(raw: unknown): CartItemPayload[] {
  if (!Array.isArray(raw)) return [];
  const byPlan = new Map<PaidPlanId, CartItemPayload>();
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const o = entry as Record<string, unknown>;
    if (!isPaidPlanId(o.planId)) continue;
    if (o.billing !== 'monthly' && o.billing !== 'yearly') continue;
    if (o.currency !== 'usd' && o.currency !== 'inr') continue;
    const id = typeof o.id === 'string' && o.id ? o.id : `${o.planId}-${Date.now()}`;
    const addedAt = typeof o.addedAt === 'number' ? o.addedAt : Date.now();
    byPlan.set(o.planId, {
      id,
      planId: o.planId,
      billing: o.billing,
      currency: o.currency,
      addedAt,
    });
  }
  return Array.from(byPlan.values()).sort((a, b) => a.addedAt - b.addedAt);
}
