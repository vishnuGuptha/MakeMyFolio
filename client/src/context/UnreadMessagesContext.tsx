import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import type { ContactMessage } from '@/types';

const POLL_MS = 15_000;

type UnreadMessagesContextValue = {
  unreadCount: number;
  refresh: () => Promise<void>;
  /** Sync badge from a full messages list (Messages page). */
  syncFromMessages: (messages: ContactMessage[]) => void;
  setUnreadCount: (count: number) => void;
};

const UnreadMessagesContext = createContext<UnreadMessagesContextValue | null>(null);

function countUnread(messages: ContactMessage[]) {
  return messages.filter((m) => !m.read && !m.archived).length;
}

export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const { activeProfile } = useAdminProfile();
  const [unreadCount, setUnreadCount] = useState(0);
  const profileId = activeProfile?._id ?? null;
  const profileIdRef = useRef(profileId);
  profileIdRef.current = profileId;

  const refresh = useCallback(async () => {
    const id = profileIdRef.current;
    if (!id) {
      setUnreadCount(0);
      return;
    }
    try {
      const { count } = await adminApi.getUnreadContactCount(id);
      if (profileIdRef.current === id) setUnreadCount(count);
    } catch {
      /* keep last known count */
    }
  }, []);

  const syncFromMessages = useCallback((messages: ContactMessage[]) => {
    setUnreadCount(countUnread(messages));
  }, []);

  useEffect(() => {
    setUnreadCount(0);
    if (!profileId) return;
    void refresh();

    const tick = () => {
      if (document.visibilityState === 'hidden') return;
      void refresh();
    };

    const interval = window.setInterval(tick, POLL_MS);
    const onFocus = () => void refresh();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [profileId, refresh]);

  return (
    <UnreadMessagesContext.Provider
      value={{ unreadCount, refresh, syncFromMessages, setUnreadCount }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const ctx = useContext(UnreadMessagesContext);
  if (!ctx) {
    return {
      unreadCount: 0,
      refresh: async () => undefined,
      syncFromMessages: (_messages: ContactMessage[]) => undefined,
      setUnreadCount: (_count: number) => undefined,
    };
  }
  return ctx;
}
