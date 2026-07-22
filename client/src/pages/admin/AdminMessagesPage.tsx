import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  Archive,
  Check,
  CheckCheck,
  Mail,
  Pin,
  PinOff,
  UserRound,
} from 'lucide-react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { useAuth } from '@/context/AuthContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/apiError';
import { Tooltip } from '@/components/ui/Tooltip';
import { useUnreadMessages } from '@/context/UnreadMessagesContext';
import type { ContactMessage } from '@/types';

type Conversation = {
  email: string;
  name: string;
  messages: ContactMessage[];
  latestAt: number;
  unreadCount: number;
  pinned: boolean;
  pinnedAt: number;
  contacted: boolean;
  preview: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();
  if (isYesterday) return `Yesterday ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatListTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function buildConversations(messages: ContactMessage[]): Conversation[] {
  const map = new Map<string, Conversation>();

  for (const msg of messages) {
    if (msg.archived) continue;
    const key = normalizeEmail(msg.email);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        email: key,
        name: msg.name,
        messages: [msg],
        latestAt: new Date(msg.createdAt).getTime(),
        unreadCount: msg.read ? 0 : 1,
        pinned: Boolean(msg.pinned),
        pinnedAt: msg.pinnedAt ? new Date(msg.pinnedAt).getTime() : 0,
        contacted: Boolean(msg.contacted),
        preview: msg.message,
      });
    } else {
      existing.messages.push(msg);
      if (!msg.read) existing.unreadCount += 1;
      if (msg.pinned) existing.pinned = true;
      if (msg.pinnedAt) {
        existing.pinnedAt = Math.max(existing.pinnedAt, new Date(msg.pinnedAt).getTime());
      }
      if (msg.contacted) existing.contacted = true;
      const t = new Date(msg.createdAt).getTime();
      if (t > existing.latestAt) {
        existing.latestAt = t;
        existing.preview = msg.message;
        existing.name = msg.name || existing.name;
      }
    }
  }

  for (const conv of map.values()) {
    conv.messages.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  return Array.from(map.values()).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.pinned && b.pinned) return b.pinnedAt - a.pinnedAt;
    return b.latestAt - a.latestAt;
  });
}

export default function AdminMessagesPage() {
  const { activeProfile } = useAdminProfile();
  const { user } = useAuth();
  const { syncFromMessages } = useUnreadMessages();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const applyMessages = (next: ContactMessage[]) => {
    setMessages(next);
    syncFromMessages(next);
  };

  const load = async (opts?: { silent?: boolean }) => {
    if (!activeProfile) return;
    if (!opts?.silent) setLoading(true);
    try {
      const data = await adminApi.getContactMessages(activeProfile._id);
      applyMessages(data);
    } catch (err) {
      if (!opts?.silent) toast.error(errorMessage(err, 'Failed to load messages'));
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [activeProfile]);

  // Keep inbox fresh while this page is open
  useEffect(() => {
    if (!activeProfile) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      void load({ silent: true });
    }, 15_000);
    const onFocus = () => void load({ silent: true });
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, [activeProfile]);

  const conversations = useMemo(() => buildConversations(messages), [messages]);
  const pinnedCount = conversations.filter((c) => c.pinned).length;

  useEffect(() => {
    if (!conversations.length) {
      setSelectedEmail(null);
      return;
    }
    if (!selectedEmail || !conversations.some((c) => c.email === selectedEmail)) {
      setSelectedEmail(conversations[0].email);
    }
  }, [conversations, selectedEmail]);

  const active = conversations.find((c) => c.email === selectedEmail) || null;

  const updateConversation = async (
    email: string,
    data: { read?: boolean; archived?: boolean; pinned?: boolean; contacted?: boolean },
    successMsg?: string
  ) => {
    if (!activeProfile) return;
    setBusy(true);
    try {
      const res = await adminApi.updateContactConversation(activeProfile._id, { email, ...data });
      applyMessages(res.messages);
      if (successMsg) toast.success(successMsg);
    } catch (err) {
      toast.error(errorMessage(err, 'Update failed'));
    } finally {
      setBusy(false);
    }
  };

  const toggleMessageRead = async (msg: ContactMessage) => {
    if (!activeProfile) return;
    setBusy(true);
    try {
      const updated = await adminApi.updateContactMessage(activeProfile._id, msg._id, {
        read: !msg.read,
      });
      setMessages((prev) => {
        const next = prev.map((m) => (m._id === msg._id ? { ...m, ...updated } : m));
        syncFromMessages(next);
        return next;
      });
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update'));
    } finally {
      setBusy(false);
    }
  };

  const openConversation = async (email: string) => {
    setSelectedEmail(email);
    const conv = conversations.find((c) => c.email === email);
    if (conv && conv.unreadCount > 0) {
      await updateConversation(email, { read: true });
    }
  };

  return (
    <RequireActiveProfile>
      <div className="mx-auto flex h-[calc(100svh-7.5rem)] max-w-6xl flex-col gap-4">
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">Messages</h1>
            <p className="mt-0.5 text-sm text-subtle">
              Chats grouped by email · pin up to 3 · latest on top
            </p>
            {user?.email ? (
              <p className="mt-1 text-xs text-subtle">
                New visitor messages also notify{' '}
                <span className="font-medium text-secondary">{user.email}</span>
                {' '}when email delivery is configured — check inbox and spam.
              </p>
            ) : null}
          </div>
          {active ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() =>
                  updateConversation(
                    active.email,
                    { contacted: !active.contacted },
                    active.contacted ? 'Unmarked contacted' : 'Marked as contacted'
                  )
                }
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {active.contacted ? 'Contacted' : 'Mark contacted'}
              </Button>
              <Tooltip
                content={!active.pinned && pinnedCount >= 3 ? 'Max 3 pinned chats' : undefined}
              >
                <span className="inline-flex">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || (!active.pinned && pinnedCount >= 3)}
                    onClick={() =>
                      updateConversation(
                        active.email,
                        { pinned: !active.pinned },
                        active.pinned ? 'Unpinned' : 'Pinned'
                      )
                    }
                  >
                    {active.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                    {active.pinned ? 'Unpin' : 'Pin'}
                  </Button>
                </span>
              </Tooltip>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => {
                  void updateConversation(active.email, { archived: true }, 'Chat archived');
                  setSelectedEmail(null);
                }}
              >
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
            </div>
          ) : null}
        </div>

        <div className="grid min-h-0 flex-1 overflow-hidden rounded-xl border border-[#0066FF]/12 bg-elevated/70 shadow-sm md:grid-cols-[minmax(240px,320px)_minmax(0,1fr)]">
          {/* Conversation list */}
          <aside className="flex min-h-0 flex-col border-b border-[#0066FF]/10 md:border-b-0 md:border-r">
            <div className="shrink-0 border-b border-[#0066FF]/10 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0066FF]/80">
                Inbox · {conversations.length}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <p className="p-4 text-sm text-subtle">Loading…</p>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                  <Mail className="h-8 w-8 text-subtle/50" />
                  <p className="text-sm text-subtle">No messages yet.</p>
                  <p className="max-w-[16rem] text-xs text-subtle">
                    When someone uses your live contact form, it shows up here
                    {user?.email ? ` and can email ${user.email}` : ''}.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const selected = conv.email === selectedEmail;
                  return (
                    <button
                      key={conv.email}
                      type="button"
                      onClick={() => void openConversation(conv.email)}
                      className={cn(
                        'flex w-full gap-3 border-b border-border/50 px-3 py-3 text-left transition-colors',
                        selected ? 'bg-[#0066FF]/10' : 'hover:bg-muted/60'
                      )}
                    >
                      <div
                        className={cn(
                          'grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold',
                          selected ? 'bg-[#0066FF]/20 text-[#0066FF]' : 'bg-muted text-secondary'
                        )}
                      >
                        {(conv.name || conv.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate text-sm font-semibold text-primary">{conv.name}</p>
                          {conv.pinned ? <Pin className="h-3 w-3 shrink-0 text-[#0066FF]" /> : null}
                          {conv.contacted ? (
                            <Tooltip content="Contacted">
                              <span className="inline-flex">
                                <CheckCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              </span>
                            </Tooltip>
                          ) : null}
                          <span className="ml-auto shrink-0 text-[10px] text-subtle">
                            {formatListTime(new Date(conv.latestAt).toISOString())}
                          </span>
                        </div>
                        <p className="truncate text-[11px] text-subtle">{conv.email}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <p className="truncate text-xs text-secondary">{conv.preview}</p>
                          {conv.unreadCount > 0 ? (
                            <span className="ml-auto shrink-0 rounded-full bg-[#0066FF] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {conv.unreadCount}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* Thread */}
          <section className="flex min-h-0 min-w-0 flex-col bg-base/40">
            {!active ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
                <UserRound className="h-10 w-10 text-subtle/40" />
                <p className="text-sm text-subtle">Select a chat to read messages</p>
              </div>
            ) : (
              <>
                <header className="flex shrink-0 items-center gap-3 border-b border-[#0066FF]/10 px-4 py-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[#0066FF]/15 text-sm font-semibold text-[#0066FF]">
                    {active.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-primary">{active.name}</p>
                    <a
                      href={`mailto:${active.email}`}
                      className="truncate text-xs text-[#0066FF] hover:underline"
                    >
                      {active.email}
                    </a>
                  </div>
                  <div className="ml-auto flex items-center gap-2 text-[11px] text-subtle">
                    {active.contacted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCheck className="h-3 w-3" /> Contacted
                      </span>
                    ) : null}
                    {active.pinned ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#0066FF]/12 px-2 py-0.5 text-[#0066FF]">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    ) : null}
                  </div>
                </header>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                  {active.messages.map((msg) => (
                    <article
                      key={msg._id}
                      className={cn(
                        'max-w-[min(100%,34rem)] rounded-2xl rounded-tl-md border px-3.5 py-2.5 shadow-sm',
                        msg.read
                          ? 'border-border/70 bg-elevated'
                          : 'border-[#0066FF]/20 bg-[#0066FF]/[0.06]'
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-primary">
                        {msg.message}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <time className="text-[11px] text-subtle" dateTime={msg.createdAt}>
                          {formatWhen(msg.createdAt)}
                        </time>
                        <Tooltip content={msg.read ? 'Mark as unread' : 'Mark as read'}>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void toggleMessageRead(msg)}
                            className={cn(
                              'ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] transition-colors',
                              msg.read
                                ? 'text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400'
                                : 'text-subtle hover:bg-muted hover:text-primary'
                            )}
                          >
                            {msg.read ? (
                              <>
                                <CheckCheck className="h-3.5 w-3.5" /> Read
                              </>
                            ) : (
                              <>
                                <Check className="h-3.5 w-3.5" /> Mark read
                              </>
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </RequireActiveProfile>
  );
}
