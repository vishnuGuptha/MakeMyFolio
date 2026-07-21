import { AppError } from '../utils/errors.js';

/**
 * Canonical checkout amounts — keep in sync with client/src/lib/plans.ts
 */

export type PlanId = 'free' | 'pro' | 'premium' | 'domain';
export type PaidPlanId = 'pro' | 'premium' | 'domain';
export type BillingInterval = 'monthly' | 'yearly';
export type PricingCurrency = 'usd' | 'inr';

export type PlanLimits = {
  id: PlanId;
  maxPortfolios: number;
  canPublish: boolean;
  /** Lifetime resume AI imports; Infinity = unlimited for paid */
  maxResumeImports: number;
  customDomain: boolean;
};

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    id: 'free',
    maxPortfolios: 1,
    canPublish: false,
    maxResumeImports: 1,
    customDomain: false,
  },
  pro: {
    id: 'pro',
    maxPortfolios: 2,
    canPublish: true,
    maxResumeImports: Infinity,
    customDomain: false,
  },
  premium: {
    id: 'premium',
    maxPortfolios: 5,
    canPublish: true,
    maxResumeImports: Infinity,
    customDomain: false,
  },
  domain: {
    id: 'domain',
    maxPortfolios: 5,
    canPublish: true,
    maxResumeImports: Infinity,
    customDomain: true,
  },
};

/** Display / charge amounts — keep in sync with client/src/lib/plans.ts */
export const PLAN_PRICES: Record<
  PaidPlanId,
  {
    name: string;
    usdMonthly: number;
    usdYearly: number;
    inrMonthly: number;
    inrYearly: number;
    comingSoon?: boolean;
  }
> = {
  pro: {
    name: 'Pro',
    usdMonthly: 1,
    usdYearly: 10,
    inrMonthly: 85,
    inrYearly: 845,
  },
  premium: {
    name: 'Premium',
    usdMonthly: 2,
    usdYearly: 20,
    inrMonthly: 169,
    inrYearly: 1690,
  },
  domain: {
    name: 'Custom domain',
    usdMonthly: 5,
    usdYearly: 50,
    inrMonthly: 423,
    inrYearly: 4225,
    comingSoon: true,
  },
};

export function normalizePlanId(raw?: string | null): PlanId {
  if (raw === 'pro' || raw === 'premium' || raw === 'domain' || raw === 'free') return raw;
  if (raw === 'team') return 'premium';
  return 'free';
}

export function getPlanLimits(plan?: string | null): PlanLimits {
  return PLAN_LIMITS[normalizePlanId(plan)];
}

export function isPaidPlanId(v: unknown): v is PaidPlanId {
  return v === 'pro' || v === 'premium' || v === 'domain';
}

/** Upgrade ladder: Free → Pro → Premium. Domain is not upgradeable. */
export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  premium: 2,
  domain: 99,
};

export type UpgradeablePlanId = 'pro' | 'premium';

export function isUpgradeablePlanId(v: unknown): v is UpgradeablePlanId {
  return v === 'pro' || v === 'premium';
}

export function listPriceMajor(
  planId: PlanId,
  billing: BillingInterval,
  currency: PricingCurrency
): number {
  if (planId === 'free') return 0;
  if (!isPaidPlanId(planId)) return 0;
  const plan = PLAN_PRICES[planId];
  return currency === 'usd'
    ? billing === 'yearly'
      ? plan.usdYearly
      : plan.usdMonthly
    : billing === 'yearly'
      ? plan.inrYearly
      : plan.inrMonthly;
}

/**
 * Amount due when moving from currentPlan → targetPlan.
 * Credit applies only for same billing + currency on a paid upgradeable plan.
 * Domain cannot be purchased via this path.
 */
export function resolveUpgradeDue(params: {
  currentPlan: PlanId;
  targetPlan: PaidPlanId;
  billing: BillingInterval;
  currency: PricingCurrency;
  currentBilling?: BillingInterval | null;
  currentCurrency?: PricingCurrency | null;
}): {
  amountMajor: number;
  amountMinor: number;
  listMajor: number;
  creditMajor: number;
  isUpgrade: boolean;
  label: string;
} {
  const { currentPlan, targetPlan, billing, currency, currentBilling, currentCurrency } = params;

  if (targetPlan === 'domain') {
    throw new AppError(
      PLAN_PRICES.domain.comingSoon
        ? 'Custom domain is not available for purchase yet'
        : 'Custom domain cannot be purchased',
      400
    );
  }
  if (!isUpgradeablePlanId(targetPlan)) {
    throw new AppError('Invalid upgrade target', 400);
  }
  if (PLAN_RANK[targetPlan] <= PLAN_RANK[currentPlan]) {
    throw new AppError('You already have this plan or a higher one', 400);
  }

  const listMajor = listPriceMajor(targetPlan, billing, currency);
  let creditMajor = 0;
  if (
    isUpgradeablePlanId(currentPlan) &&
    currentBilling === billing &&
    currentCurrency === currency
  ) {
    creditMajor = listPriceMajor(currentPlan, billing, currency);
  }

  const amountMajor = Math.max(0, listMajor - creditMajor);
  const amountMinor = Math.round(amountMajor * 100);
  const isUpgrade = creditMajor > 0;
  const name = PLAN_PRICES[targetPlan].name;
  const label = isUpgrade
    ? `Upgrade to ${name} (${billing === 'yearly' ? 'yearly' : 'monthly'})`
    : `${name} (${billing === 'yearly' ? 'yearly' : 'monthly'})`;

  return { amountMajor, amountMinor, listMajor, creditMajor, isUpgrade, label };
}

export function resolveCheckoutAmount(
  planId: PaidPlanId,
  billing: BillingInterval,
  currency: PricingCurrency
): { amountMajor: number; amountMinor: number; label: string } {
  const plan = PLAN_PRICES[planId];
  const amountMajor = listPriceMajor(planId, billing, currency);
  const amountMinor = Math.round(amountMajor * 100);
  const label = `${plan.name} (${billing === 'yearly' ? 'yearly' : 'monthly'})`;
  return { amountMajor, amountMinor, label };
}

export const FREE_PUBLISH_MESSAGE =
  'Free accounts can build and preview a draft, but publishing a live folio requires Pro or higher. Upgrade to go live.';

export const FREE_IMPORT_USED_MESSAGE =
  'Your free resume import has already been used. Upgrade to Pro or Premium for unlimited imports.';

export const PORTFOLIO_LIMIT_MESSAGE = (max: number, plan: string) =>
  `Your ${plan} plan allows up to ${max} portfolio${max === 1 ? '' : 's'}. Upgrade to add more.`;
