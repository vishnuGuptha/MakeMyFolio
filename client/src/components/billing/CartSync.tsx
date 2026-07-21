import { useEffect, useRef } from 'react';
import { billingApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import {
  mergeCarts,
  readCart,
  replaceCart,
  setCartPersistHandler,
  type CartItem,
} from '@/lib/planCheckout';

/**
 * When a user is signed in: merge guest cart with account cart, then
 * debounce-persist local changes to the server.
 */
export function CartSync() {
  const { user, loading } = useAuth();
  const syncedFor = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (user?.role !== 'user') {
      syncedFor.current = null;
      setCartPersistHandler(null);
      return;
    }

    const userKey = user.email;
    let cancelled = false;
    let persistTimer: ReturnType<typeof setTimeout> | null = null;

    setCartPersistHandler((items: CartItem[]) => {
      if (persistTimer) clearTimeout(persistTimer);
      persistTimer = setTimeout(() => {
        billingApi.saveCart(items).catch(() => {
          /* offline / transient — local cart remains */
        });
      }, 450);
    });

    (async () => {
      if (syncedFor.current === userKey) return;
      try {
        const remote = await billingApi.getCart();
        if (cancelled) return;
        const merged = mergeCarts(readCart(), remote.items || []);
        replaceCart(merged, { skipPersist: true });
        await billingApi.saveCart(merged);
        if (!cancelled) syncedFor.current = userKey;
      } catch {
        /* keep local cart if sync fails */
      }
    })();

    return () => {
      cancelled = true;
      if (persistTimer) clearTimeout(persistTimer);
      setCartPersistHandler(null);
    };
  }, [user, loading]);

  return null;
}
