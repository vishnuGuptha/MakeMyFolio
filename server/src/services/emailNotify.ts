/**
 * Optional transactional email hooks (Resend / SES / Zapier / Make, etc.).
 * When no webhook is configured, messages are logged to the server console.
 */

export type ContactMessageEmailPayload = {
  type: 'contact_message';
  to: string;
  ownerName: string;
  visitorName: string;
  visitorEmail: string;
  message: string;
  portfolioName: string;
  portfolioSlug: string;
  inboxUrl: string;
  subject: string;
};

function webhookUrlForContact(): string | undefined {
  return (
    process.env.CONTACT_EMAIL_WEBHOOK?.trim() ||
    process.env.EMAIL_WEBHOOK?.trim() ||
    undefined
  );
}

export async function notifyOwnerOfContactMessage(
  payload: Omit<ContactMessageEmailPayload, 'type' | 'subject'> & { subject?: string }
): Promise<void> {
  const body: ContactMessageEmailPayload = {
    type: 'contact_message',
    subject:
      payload.subject ||
      `New message on ${payload.portfolioName} from ${payload.visitorName}`,
    to: payload.to,
    ownerName: payload.ownerName,
    visitorName: payload.visitorName,
    visitorEmail: payload.visitorEmail,
    message: payload.message,
    portfolioName: payload.portfolioName,
    portfolioSlug: payload.portfolioSlug,
    inboxUrl: payload.inboxUrl,
  };

  const webhook = webhookUrlForContact();
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.error(
          `[contact-email] webhook ${res.status} ${res.statusText} for ${body.to}`
        );
      }
    } catch (err) {
      console.error('[contact-email] webhook failed', err);
    }
    return;
  }

  console.log(
    `[contact-email] → ${body.to}\n` +
      `  From: ${body.visitorName} <${body.visitorEmail}>\n` +
      `  Folio: ${body.portfolioName} (${body.portfolioSlug})\n` +
      `  Inbox: ${body.inboxUrl}\n` +
      `  Message: ${body.message.slice(0, 280)}${body.message.length > 280 ? '…' : ''}`
  );
}

export type PaymentReceiptEmailPayload = {
  type: 'payment_receipt';
  to: string;
  subject: string;
  payerName: string;
  orderId: string;
  planName: string;
  billing: string;
  amountFormatted: string;
  currency: string;
  paidAt: string | null;
  provider: string;
  paymentReference: string | null;
  receiptUrl: string;
};

function webhookUrlForReceipt(): string | undefined {
  return (
    process.env.RECEIPT_EMAIL_WEBHOOK?.trim() ||
    process.env.EMAIL_WEBHOOK?.trim() ||
    undefined
  );
}

export async function notifyPaymentReceipt(
  payload: Omit<PaymentReceiptEmailPayload, 'type' | 'subject'> & { subject?: string }
): Promise<void> {
  const body: PaymentReceiptEmailPayload = {
    type: 'payment_receipt',
    subject:
      payload.subject ||
      `Receipt · ${payload.planName} · ${payload.amountFormatted}`,
    to: payload.to,
    payerName: payload.payerName,
    orderId: payload.orderId,
    planName: payload.planName,
    billing: payload.billing,
    amountFormatted: payload.amountFormatted,
    currency: payload.currency,
    paidAt: payload.paidAt,
    provider: payload.provider,
    paymentReference: payload.paymentReference,
    receiptUrl: payload.receiptUrl,
  };

  const webhook = webhookUrlForReceipt();
  if (webhook) {
    try {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.error(
          `[receipt-email] webhook ${res.status} ${res.statusText} for ${body.to}`
        );
      }
    } catch (err) {
      console.error('[receipt-email] webhook failed', err);
    }
    return;
  }

  console.log(
    `[receipt-email] → ${body.to}\n` +
      `  Plan: ${body.planName} (${body.billing})\n` +
      `  Amount: ${body.amountFormatted}\n` +
      `  Order: ${body.orderId}\n` +
      `  Ref: ${body.paymentReference || '—'}\n` +
      `  Receipt: ${body.receiptUrl}`
  );
}
