import { billingApi } from '@/api';
import { errorMessage } from '@/lib/apiError';
import { toast } from 'sonner';

/** Fetch auth'd HTML receipt and open in a new tab (print / save as PDF). */
export async function openPaymentReceipt(orderId: string): Promise<void> {
  try {
    const html = await billingApi.getReceiptHtml(orderId);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      toast.error('Allow pop-ups to view the receipt');
      URL.revokeObjectURL(url);
      return;
    }
    // Revoke after the tab has a chance to load
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    toast.error(errorMessage(err, 'Could not open receipt'));
  }
}
