import type { IPaymentOrder } from '../models/PaymentOrder.js';
import { PLAN_PRICES } from '../lib/plans.js';

export type PaymentReceipt = {
  orderId: string;
  planId: string;
  planName: string;
  billing: string;
  currency: string;
  amountMinor: number;
  amountFormatted: string;
  provider: string;
  paymentReference: string | null;
  paidAt: string | null;
  payerEmail: string;
  payerName: string;
  merchantName: string;
  note: string;
};

function formatAmount(amountMinor: number, currency: string): string {
  const major = amountMinor / 100;
  if (currency === 'inr') {
    return `₹${major.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
  return `$${major.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function buildPaymentReceipt(params: {
  order: IPaymentOrder;
  payerEmail: string;
  payerName?: string;
}): PaymentReceipt {
  const { order, payerEmail, payerName } = params;
  const planName =
    PLAN_PRICES[order.planId as keyof typeof PLAN_PRICES]?.name || order.planId;
  const paymentReference =
    order.razorpayPaymentId ||
    order.stripePaymentIntentId ||
    order.stripeSessionId ||
    null;

  return {
    orderId: order._id.toString(),
    planId: order.planId,
    planName,
    billing: order.billing,
    currency: order.currency,
    amountMinor: order.amountMinor,
    amountFormatted: formatAmount(order.amountMinor, order.currency),
    provider: order.provider,
    paymentReference,
    paidAt: order.paidAt ? order.paidAt.toISOString() : null,
    payerEmail,
    payerName: payerName?.trim() || 'Customer',
    merchantName: 'BuildMyFolio',
    note:
      order.currency === 'inr'
        ? 'This is a payment receipt for your records. GST invoice available on request where applicable.'
        : 'This is a payment receipt for your records.',
  };
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderReceiptHtml(receipt: PaymentReceipt): string {
  const paidLabel = receipt.paidAt
    ? new Date(receipt.paidAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Receipt · ${esc(receipt.merchantName)} · ${esc(receipt.orderId)}</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; background: #f6f7f9; color: #111; }
    .wrap { max-width: 560px; margin: 32px auto; padding: 0 16px; }
    .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 28px 24px; }
    h1 { font-size: 1.25rem; margin: 0 0 4px; }
    .muted { color: #6b7280; font-size: 0.875rem; }
    .amount { font-size: 1.75rem; font-weight: 700; margin: 20px 0 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9rem; }
    th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    th { color: #6b7280; font-weight: 500; width: 42%; }
    .actions { margin-top: 20px; display: flex; gap: 8px; flex-wrap: wrap; }
    button { appearance: none; border: 1px solid #d1d5db; background: #fff; border-radius: 8px; padding: 8px 12px; font: inherit; cursor: pointer; }
    @media print {
      body { background: #fff; }
      .wrap { margin: 0; max-width: none; }
      .card { border: none; padding: 0; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <h1>Payment receipt</h1>
      <p class="muted">${esc(receipt.merchantName)}</p>
      <p class="amount">${esc(receipt.amountFormatted)}</p>
      <p class="muted">Paid · ${esc(paidLabel)}</p>
      <table>
        <tr><th>Billed to</th><td>${esc(receipt.payerName)}<br/><span class="muted">${esc(receipt.payerEmail)}</span></td></tr>
        <tr><th>Plan</th><td>${esc(receipt.planName)} (${esc(receipt.billing)})</td></tr>
        <tr><th>Order ID</th><td><code>${esc(receipt.orderId)}</code></td></tr>
        <tr><th>Payment ref</th><td><code>${esc(receipt.paymentReference || '—')}</code></td></tr>
        <tr><th>Provider</th><td>${esc(receipt.provider)}</td></tr>
        <tr><th>Currency</th><td>${esc(receipt.currency.toUpperCase())}</td></tr>
      </table>
      <p class="muted" style="margin-top:20px">${esc(receipt.note)}</p>
      <div class="actions">
        <button type="button" onclick="window.print()">Print / Save as PDF</button>
      </div>
    </div>
  </div>
</body>
</html>`;
}
