import { getPortfolioUrlPlaceholder } from '@/lib/domains';

/**
 * Plan catalog — keep limits in sync with server/src/lib/plans.ts
 * Checkout later: Stripe (USD) / Razorpay+UPI (INR).
 */

export type PlanId = 'free' | 'pro' | 'premium' | 'domain';
export type PricingCurrency = 'usd' | 'inr';
export type BillingInterval = 'monthly' | 'yearly';

/** Display FX for INR toggle (not live rates). Checkout will use gateway rates. */
export const USD_TO_INR = 84.5;

export type PlanDef = {
  id: PlanId;
  name: string;
  description: string;
  highlighted?: boolean;
  comingSoon?: boolean;
  /** Canonical USD amounts for Stripe / display */
  priceUsdMonthly: number;
  priceUsdYearly: number;
  /** Rounded INR for Razorpay / UPI */
  priceInrMonthly: number;
  priceInrYearly: number;
  features: string[];
  limits: {
    maxPortfolios: number;
    canPublish: boolean;
    maxResumeImports: number | null;
    customDomain: boolean;
  };
  cta: string;
  ctaDisabledLabel?: string;
  ctaTo: string;
};

/**
 * USD list prices (source of truth):
 * - Pro: $1/mo · $10/yr (~2 months free)
 * - Premium: $2/mo · $20/yr
 * - Domain: $5/mo · $50/yr (coming soon)
 * INR = round(USD × 84.5) for display until live FX at checkout.
 */
export const PLANS: PlanDef[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Try BuildMyFolio with one private draft — perfect for first-time setup.',
    priceUsdMonthly: 0,
    priceUsdYearly: 0,
    priceInrMonthly: 0,
    priceInrYearly: 0,
    features: [
      '1 portfolio (draft only)',
      'Preview anytime — publish locked',
      '1 resume import (lifetime)',
      `${getPortfolioUrlPlaceholder().replace('your-name', '{slug}')} when you upgrade`,
      'Contact form ready after upgrade',
    ],
    limits: {
      maxPortfolios: 1,
      canPublish: false,
      maxResumeImports: 1,
      customDomain: false,
    },
    cta: 'Start free',
    ctaDisabledLabel: 'Already on Free',
    ctaTo: '/register?plan=free',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Go live with two folios on our subdomain — pay monthly or save yearly.',
    highlighted: true,
    priceUsdMonthly: 1,
    priceUsdYearly: 10,
    priceInrMonthly: 85,
    priceInrYearly: 845,
    features: [
      '2 live portfolios',
      'Publish to subdomain URL',
      'Unlimited resume imports',
      'All core themes',
      'No custom domain',
    ],
    limits: {
      maxPortfolios: 2,
      canPublish: true,
      maxResumeImports: null,
      customDomain: false,
    },
    cta: 'Get Pro',
    ctaTo: '/register?plan=pro',
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Five folios for freelancers juggling brands — still wallet-friendly.',
    priceUsdMonthly: 2,
    priceUsdYearly: 20,
    priceInrMonthly: 169,
    priceInrYearly: 1690,
    features: [
      '5 live portfolios',
      'Publish to subdomain URLs',
      'Unlimited resume imports',
      'All themes unlocked',
      'Priority support (email)',
    ],
    limits: {
      maxPortfolios: 5,
      canPublish: true,
      maxResumeImports: null,
      customDomain: false,
    },
    cta: 'Get Premium',
    ctaTo: '/register?plan=premium',
  },
  {
    id: 'domain',
    name: 'Custom domain',
    description: 'Point your own domain at a folio instead of our subdomain.',
    comingSoon: true,
    priceUsdMonthly: 5,
    priceUsdYearly: 50,
    priceInrMonthly: 423,
    priceInrYearly: 4225,
    features: [
      'Everything in Premium',
      'Connect your custom domain',
      'SSL managed for you',
      'DNS setup guide',
      'Card & UPI checkout',
    ],
    limits: {
      maxPortfolios: 5,
      canPublish: true,
      maxResumeImports: null,
      customDomain: true,
    },
    cta: 'Coming soon',
    ctaDisabledLabel: 'Coming soon…',
    ctaTo: '/register?plan=domain',
  },
];

const CURRENCY_KEY = 'bmf-pricing-currency';

/** Stripe USD checkout — not live yet; INR (Razorpay) is the default. */
export const USD_CHECKOUT_ENABLED = false;

export function readStoredCurrency(): PricingCurrency {
  try {
    const v = localStorage.getItem(CURRENCY_KEY);
    if (v === 'inr') return 'inr';
    if (v === 'usd' && USD_CHECKOUT_ENABLED) return 'usd';
  } catch {
    /* ignore */
  }
  return 'inr';
}

export function storeCurrency(currency: PricingCurrency) {
  if (currency === 'usd' && !USD_CHECKOUT_ENABLED) {
    currency = 'inr';
  }
  try {
    localStorage.setItem(CURRENCY_KEY, currency);
  } catch {
    /* ignore */
  }
}

/** Coerce to a currently payable currency (INR until USD ships). */
export function resolveCheckoutCurrency(currency?: PricingCurrency | null): PricingCurrency {
  if (currency === 'usd' && USD_CHECKOUT_ENABLED) return 'usd';
  return 'inr';
}

export function formatPlanPrice(
  plan: PlanDef,
  currency: PricingCurrency,
  billing: BillingInterval
): { price: string; note: string; equivalent?: string } {
  const isYearly = billing === 'yearly';
  const usd = isYearly ? plan.priceUsdYearly : plan.priceUsdMonthly;
  const inr = isYearly ? plan.priceInrYearly : plan.priceInrMonthly;

  if (plan.id === 'free') {
    return {
      price: currency === 'usd' ? '$0' : '₹0',
      note: 'forever',
    };
  }

  if (currency === 'usd') {
    return {
      price: `$${usd}`,
      note: isYearly
        ? plan.comingSoon
          ? '/yr · soon'
          : '/yr · ~2 mo free'
        : plan.comingSoon
          ? '/mo · soon'
          : '/mo',
      equivalent: `≈ ₹${inr.toLocaleString('en-IN')}`,
    };
  }

  return {
    price: `₹${inr.toLocaleString('en-IN')}`,
    note: isYearly
      ? plan.comingSoon
        ? '/yr · soon'
        : '/yr · ~2 mo free'
      : plan.comingSoon
        ? '/mo · soon'
        : '/mo',
    equivalent: `≈ $${usd}`,
  };
}

/** Free → Pro → Premium. Domain is shown but not upgradeable. */
export const PLAN_RANK: Record<PlanId, number> = {
  free: 0,
  pro: 1,
  premium: 2,
  domain: 99,
};

export type UpgradeablePlanId = 'pro' | 'premium';

export function isUpgradeablePlanId(id: PlanId): id is UpgradeablePlanId {
  return id === 'pro' || id === 'premium';
}

export function listPriceMajor(
  planId: PlanId,
  billing: BillingInterval,
  currency: PricingCurrency
): number {
  const plan = getPlan(planId);
  if (planId === 'free') return 0;
  return currency === 'usd'
    ? billing === 'yearly'
      ? plan.priceUsdYearly
      : plan.priceUsdMonthly
    : billing === 'yearly'
      ? plan.priceInrYearly
      : plan.priceInrMonthly;
}

export function formatMoney(amount: number, currency: PricingCurrency): string {
  if (currency === 'usd') return `$${amount}`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** Client-side due preview (server is source of truth at checkout). */
export function previewUpgradeDue(params: {
  currentPlan: PlanId;
  targetPlan: PlanId;
  billing: BillingInterval;
  currency: PricingCurrency;
  currentBilling?: BillingInterval | null;
  currentCurrency?: PricingCurrency | null;
}): {
  ok: boolean;
  reason?: string;
  amountMajor: number;
  listMajor: number;
  creditMajor: number;
  isUpgrade: boolean;
  dueLabel: string;
} {
  const { currentPlan, targetPlan, billing, currency, currentBilling, currentCurrency } = params;

  if (targetPlan === 'domain') {
    return {
      ok: false,
      reason: getPlan('domain').comingSoon
        ? 'Custom domain is not available yet'
        : 'Custom domain is not available',
      amountMajor: 0,
      listMajor: 0,
      creditMajor: 0,
      isUpgrade: false,
      dueLabel: '',
    };
  }
  if (!isUpgradeablePlanId(targetPlan)) {
    return {
      ok: false,
      reason: 'Not a paid plan',
      amountMajor: 0,
      listMajor: 0,
      creditMajor: 0,
      isUpgrade: false,
      dueLabel: '',
    };
  }
  if (PLAN_RANK[targetPlan] <= PLAN_RANK[currentPlan]) {
    return {
      ok: false,
      reason:
        PLAN_RANK[targetPlan] === PLAN_RANK[currentPlan]
          ? 'Current plan'
          : 'You already have a higher plan',
      amountMajor: 0,
      listMajor: listPriceMajor(targetPlan, billing, currency),
      creditMajor: 0,
      isUpgrade: false,
      dueLabel: '',
    };
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
  const isUpgrade = creditMajor > 0;

  return {
    ok: true,
    amountMajor,
    listMajor,
    creditMajor,
    isUpgrade,
    dueLabel: isUpgrade
      ? `Pay ${formatMoney(amountMajor, currency)} remaining`
      : `Pay ${formatMoney(amountMajor, currency)}`,
  };
}

export function getPlan(id: PlanId) {
  return PLANS.find((p) => p.id === id) || PLANS[0];
}

export function normalizePlanId(raw?: string | null): PlanId {
  if (raw === 'pro' || raw === 'premium' || raw === 'domain' || raw === 'free') return raw;
  if (raw === 'team') return 'premium';
  return 'free';
}

export const FREE_PUBLISH_MESSAGE =
  'Free accounts can build and preview a draft, but cannot publish a live site. Upgrade to Pro or Premium to go live.';

export const FREE_IMPORT_USED_MESSAGE =
  'Your free resume import has already been used. Upgrade for unlimited imports.';
