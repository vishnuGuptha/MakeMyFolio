import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi, billingApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/apiError';
import { BRAND } from '@/brand/constants';
import { openPaymentReceipt } from '@/lib/openReceipt';
import { formatMoney, getPlan, normalizePlanId, type PricingCurrency } from '@/lib/plans';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

type BillingOrder = {
  id: string;
  planId: string;
  billing: string;
  currency: PricingCurrency;
  amountMinor: number;
  provider: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
  reference: string | null;
};

function formatOrderDate(iso: string | null | undefined) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function statusBadge(status: string) {
  if (status === 'paid') return 'accent' as const;
  if (status === 'failed') return 'outline' as const;
  return 'outline' as const;
}

export default function AdminAccountPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<BillingOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [openingReceiptId, setOpeningReceiptId] = useState<string | null>(null);

  const planId = normalizePlanId(user?.plan);
  const planName = getPlan(planId).name;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setOrdersLoading(true);
      try {
        const res = await billingApi.getOrders();
        if (!cancelled) setOrders(res.orders || []);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Deep link from receipt email: /dashboard/account?receipt=<orderId>
  useEffect(() => {
    const receiptId = searchParams.get('receipt');
    if (!receiptId) return;
    void (async () => {
      setOpeningReceiptId(receiptId);
      await openPaymentReceipt(receiptId);
      setOpeningReceiptId(null);
      const next = new URLSearchParams(searchParams);
      next.delete('receipt');
      setSearchParams(next, { replace: true });
    })();
  }, [searchParams, setSearchParams]);

  const viewReceipt = async (orderId: string) => {
    setOpeningReceiptId(orderId);
    await openPaymentReceipt(orderId);
    setOpeningReceiptId(null);
  };

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change password'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">Account</h1>
        <p className="mt-1 text-sm text-subtle">Signed in as {user?.email}</p>
      </div>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-primary">Your plan</h2>
          <Badge variant={planId === 'free' ? 'outline' : 'accent'} className="text-[10px]">
            {planName}
          </Badge>
        </div>
        <p className="text-sm text-secondary">
          {user?.planBilling
            ? `Billed ${user.planBilling === 'yearly' ? 'yearly' : 'monthly'}${
                user.planCurrency ? ` · ${user.planCurrency.toUpperCase()}` : ''
              }.`
            : planId === 'free'
              ? 'Free plan — upgrade anytime from pricing.'
              : 'Plan active on your account.'}
        </p>
        <ul className="list-disc space-y-1 pl-5 text-xs text-subtle">
          <li>Upgrades take effect immediately after payment.</li>
          <li>We never silently downgrade your plan.</li>
          <li>
            For refunds or billing help,{' '}
            <a
              href={`mailto:support@${BRAND.domain}`}
              className="font-medium text-[#0066FF] hover:underline"
            >
              contact support
            </a>
            .
          </li>
          <li>
            Paid orders get a receipt you can open from Billing history
            {user?.email ? (
              <>
                {' '}(also emailed to <span className="text-secondary">{user.email}</span> when
                receipt delivery is configured)
              </>
            ) : null}
            .
          </li>
          <li>USD / card checkout (Stripe) is coming soon — INR via Razorpay is live.</li>
          <li>
            Contact form messages are saved in Messages
            {user?.email ? (
              <>
                {' '}and can email <span className="text-secondary">{user.email}</span> when
                notifications are enabled on the server
              </>
            ) : null}
            .
          </li>
        </ul>
        <Button size="sm" variant="outline" asChild>
          <Link to="/dashboard/pricing">Manage plan</Link>
        </Button>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-primary">Billing history</h2>
        </div>
        {ordersLoading ? (
          <p className="text-sm text-subtle">Loading payments…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-secondary">
            No payments yet.{' '}
            <Link to="/dashboard/pricing" className="font-medium text-[#0066FF] hover:underline">
              View pricing
            </Link>
          </p>
        ) : (
          <ul className="divide-y divide-border/60">
            {orders.map((o) => {
              const amountMajor = Math.round(o.amountMinor) / 100;
              const name = getPlan(normalizePlanId(o.planId)).name;
              return (
                <li key={o.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary">
                      {name}{' '}
                      <span className="font-normal text-subtle">
                        · {o.billing === 'yearly' ? 'yearly' : 'monthly'}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xs text-subtle">
                      {formatOrderDate(o.paidAt || o.createdAt)}
                      {o.reference ? ` · ${o.reference.slice(0, 14)}…` : ''}
                    </p>
                    {o.status === 'paid' ? (
                      <button
                        type="button"
                        disabled={openingReceiptId === o.id}
                        onClick={() => void viewReceipt(o.id)}
                        className="mt-1 inline-block text-[11px] font-medium text-[#0066FF] hover:underline disabled:opacity-60"
                      >
                        {openingReceiptId === o.id ? 'Opening…' : 'View receipt'}
                      </button>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-primary">
                      {formatMoney(amountMajor, o.currency)}
                    </p>
                    <Badge variant={statusBadge(o.status)} className="mt-1 text-[10px] capitalize">
                      {o.status}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="mb-4 font-semibold text-primary">Change password</h2>
        <form onSubmit={handleChange} className="space-y-4">
          <FormField label="Current password">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </FormField>
          <FormField label="New password">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirm new password">
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </FormField>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Update password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
