import type { BillingInterval, PlanId, PricingCurrency } from '@/lib/plans';

/** Paid plans that can enter checkout / cart (not Free). */
export type PaidPlanId = Exclude<PlanId, 'free'>;

export type CheckoutIntent = {
  planId: PaidPlanId;
  billing: BillingInterval;
  currency: PricingCurrency;
};

export type CartItem = CheckoutIntent & {
  id: string;
  addedAt: number;
};

const INTENT_KEY = 'bmf-checkout-intent';
const OPEN_AFTER_AUTH_KEY = 'bmf-open-checkout';
const CART_KEY = 'bmf-cart';
const CART_EVENT = 'bmf-cart-updated';

function isPaidPlanId(v: unknown): v is PaidPlanId {
  return v === 'pro' || v === 'premium' || v === 'domain';
}

function isBilling(v: unknown): v is BillingInterval {
  return v === 'monthly' || v === 'yearly';
}

function isCurrency(v: unknown): v is PricingCurrency {
  return v === 'usd' || v === 'inr';
}

function parseIntent(raw: unknown): CheckoutIntent | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (!isPaidPlanId(o.planId) || !isBilling(o.billing) || !isCurrency(o.currency)) return null;
  return { planId: o.planId, billing: o.billing, currency: o.currency };
}

function emitCartUpdated() {
  try {
    window.dispatchEvent(new Event(CART_EVENT));
  } catch {
    /* ignore */
  }
}

export function setCheckoutIntent(intent: CheckoutIntent) {
  try {
    localStorage.setItem(INTENT_KEY, JSON.stringify(intent));
  } catch {
    /* ignore */
  }
}

export function readCheckoutIntent(): CheckoutIntent | null {
  try {
    const raw = localStorage.getItem(INTENT_KEY);
    if (!raw) return null;
    return parseIntent(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearCheckoutIntent() {
  try {
    localStorage.removeItem(INTENT_KEY);
  } catch {
    /* ignore */
  }
}

/** After login/register, Pricing should auto-open checkout once. */
export function markOpenCheckoutAfterAuth() {
  try {
    localStorage.setItem(OPEN_AFTER_AUTH_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function consumeOpenCheckoutAfterAuth(): boolean {
  try {
    const v = localStorage.getItem(OPEN_AFTER_AUTH_KEY);
    if (v !== '1') return false;
    localStorage.removeItem(OPEN_AFTER_AUTH_KEY);
    return true;
  } catch {
    return false;
  }
}

export function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item): CartItem | null => {
        const intent = parseIntent(item);
        if (!intent || typeof item !== 'object' || !item) return null;
        const o = item as Record<string, unknown>;
        const id = typeof o.id === 'string' ? o.id : `${intent.planId}-${Date.now()}`;
        const addedAt = typeof o.addedAt === 'number' ? o.addedAt : Date.now();
        return { ...intent, id, addedAt };
      })
      .filter((x): x is CartItem => Boolean(x));
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[], opts?: { skipPersist?: boolean }) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    emitCartUpdated();
    if (!opts?.skipPersist) {
      cartPersistHandler?.(items);
    }
  } catch {
    /* ignore */
  }
}

/** Replace cart contents (used after server merge). */
export function replaceCart(items: CartItem[], opts?: { skipPersist?: boolean }) {
  writeCart(normalizeLocalCart(items), opts);
}

export function mergeCarts(local: CartItem[], remote: CartItem[]): CartItem[] {
  const map = new Map<PaidPlanId, CartItem>();
  for (const item of remote) map.set(item.planId, item);
  for (const item of local) map.set(item.planId, item); // local wins on conflict
  return Array.from(map.values()).sort((a, b) => a.addedAt - b.addedAt);
}

function normalizeLocalCart(items: CartItem[]): CartItem[] {
  const byPlan = new Map<PaidPlanId, CartItem>();
  for (const item of items) {
    if (!isPaidPlanId(item.planId)) continue;
    byPlan.set(item.planId, item);
  }
  return Array.from(byPlan.values()).sort((a, b) => a.addedAt - b.addedAt);
}

type CartPersistHandler = (items: CartItem[]) => void;
let cartPersistHandler: CartPersistHandler | null = null;

/** Wire remote save when the user is logged in. */
export function setCartPersistHandler(handler: CartPersistHandler | null) {
  cartPersistHandler = handler;
}

/** Upsert by planId — latest billing/currency wins. */
export function addToCart(intent: CheckoutIntent): CartItem {
  const items = readCart().filter((i) => i.planId !== intent.planId);
  const item: CartItem = {
    ...intent,
    id: `${intent.planId}-${Date.now()}`,
    addedAt: Date.now(),
  };
  items.push(item);
  writeCart(items);
  return item;
}

export function updateCartItem(
  id: string,
  patch: Partial<Pick<CartItem, 'billing' | 'currency'>>
) {
  const items = readCart().map((i) => (i.id === id ? { ...i, ...patch } : i));
  writeCart(items);
}

export function removeFromCart(id: string) {
  writeCart(readCart().filter((i) => i.id !== id));
}

export function removeFromCartByPlanId(planId: PaidPlanId) {
  writeCart(readCart().filter((i) => i.planId !== planId));
}

export function isInCart(planId: PaidPlanId): boolean {
  return readCart().some((i) => i.planId === planId);
}

export function cartCount(): number {
  return readCart().length;
}

export function subscribeCart(listener: () => void) {
  window.addEventListener(CART_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(CART_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}

/** Path to return to after auth so pricing can open checkout. */
export const PRICING_CHECKOUT_NEXT = '/dashboard/pricing';
export const DASHBOARD_PRICING_PATH = '/dashboard/pricing';
export const DASHBOARD_CART_PATH = '/dashboard/cart';
export const PUBLIC_PRICING_PATH = '/pricing';
export const PUBLIC_CART_PATH = '/cart';

export function buildAuthPath(
  path: '/login' | '/register',
  opts?: { next?: string; claimGuest?: boolean }
) {
  const qs = new URLSearchParams();
  if (opts?.claimGuest) qs.set('claimGuest', '1');
  if (opts?.next) qs.set('next', opts.next);
  const q = qs.toString();
  return q ? `${path}?${q}` : path;
}
