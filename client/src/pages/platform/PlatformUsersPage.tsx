import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Trash2 } from 'lucide-react';
import { platformApi } from '@/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { errorMessage } from '@/lib/apiError';
import { getPublicPortfolioLabel, getPublicPortfolioUrl } from '@/lib/utils';

type PlatformUser = Awaited<ReturnType<typeof platformApi.getUsers>>[number];
type AssignablePlan = 'free' | 'pro' | 'premium';
type BillingInterval = 'monthly' | 'yearly';

type PlanDraft = {
  plan: AssignablePlan;
  planBilling: BillingInterval;
};

function toDraft(user: PlatformUser): PlanDraft {
  const plan: AssignablePlan =
    user.plan === 'pro' || user.plan === 'premium' ? user.plan : 'free';
  return {
    plan,
    planBilling: user.planBilling === 'yearly' ? 'yearly' : 'monthly',
  };
}

function planLabel(plan: string, billing: string | null) {
  if (plan === 'free') return 'Free';
  const period = billing === 'yearly' ? 'Yearly' : 'Monthly';
  return `${plan === 'premium' ? 'Premium' : 'Pro'} · ${period}`;
}

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [drafts, setDrafts] = useState<Record<string, PlanDraft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = () =>
    platformApi
      .getUsers()
      .then((list) => {
        setUsers(list);
        setDrafts(Object.fromEntries(list.map((u) => [u._id, toDraft(u)])));
      })
      .catch(console.error);

  useEffect(() => {
    load();
  }, []);

  const removeUser = async (id: string, name: string) => {
    if (!confirm(`Delete user ${name} and their portfolios?`)) return;
    await platformApi.deleteUser(id);
    toast.success('User deleted');
    load();
  };

  const setDraft = (id: string, patch: Partial<PlanDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? { plan: 'free', planBilling: 'monthly' }), ...patch },
    }));
  };

  const applyPlan = async (user: PlatformUser) => {
    const draft = drafts[user._id] ?? toDraft(user);
    setSavingId(user._id);
    try {
      await platformApi.setUserPlan(user._id, {
        plan: draft.plan,
        planBilling: draft.plan === 'free' ? null : draft.planBilling,
        planCurrency: draft.plan === 'free' ? null : user.planCurrency ?? 'usd',
      });
      toast.success(`Updated ${user.name} to ${planLabel(draft.plan, draft.planBilling)}`);
      await load();
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update plan'));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Users</h1>
        <p className="text-sm text-subtle">Everyone who signed up — upgrade plans directly</p>
      </div>
      <div className="space-y-4">
        {users.map((user) => {
          const draft = drafts[user._id] ?? toDraft(user);
          const dirty =
            draft.plan !== (user.plan === 'pro' || user.plan === 'premium' ? user.plan : 'free') ||
            (draft.plan !== 'free' &&
              draft.planBilling !== (user.planBilling === 'yearly' ? 'yearly' : 'monthly'));
          return (
            <Card key={user._id} className="glass-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-primary">{user.name}</h3>
                    <Badge variant="accent">{planLabel(user.plan, user.planBilling)}</Badge>
                  </div>
                  <p className="text-sm text-subtle">{user.email}</p>
                  <p className="mt-1 font-mono text-xs text-subtle">
                    Joined {new Date(user.createdAt).toLocaleDateString()} ·{' '}
                    {user.portfolios.length} portfolio(s)
                  </p>
                  <div className="mt-3 space-y-2">
                    {user.portfolios.map((p) => (
                      <div key={p._id} className="flex items-center gap-2 text-sm">
                        <a
                          href={getPublicPortfolioUrl(p.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-accent hover:underline"
                        >
                          {p.displayName} <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="font-mono text-xs text-subtle">
                          {getPublicPortfolioLabel(p.slug)}
                        </span>
                        {p.isPublished ? (
                          <Badge variant="accent">Live</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end md:flex-col md:items-stretch">
                  <div className="flex flex-wrap gap-2">
                    <label className="flex flex-col gap-1 text-[11px] font-medium text-subtle">
                      Plan
                      <select
                        className="h-9 min-w-[7.5rem] rounded-lg border border-border bg-elevated px-2 text-sm text-primary"
                        value={draft.plan}
                        onChange={(e) =>
                          setDraft(user._id, { plan: e.target.value as AssignablePlan })
                        }
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="premium">Premium</option>
                      </select>
                    </label>
                    {draft.plan !== 'free' ? (
                      <label className="flex flex-col gap-1 text-[11px] font-medium text-subtle">
                        Billing
                        <select
                          className="h-9 min-w-[7.5rem] rounded-lg border border-border bg-elevated px-2 text-sm text-primary"
                          value={draft.planBilling}
                          onChange={(e) =>
                            setDraft(user._id, {
                              planBilling: e.target.value as BillingInterval,
                            })
                          }
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </label>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      disabled={!dirty || savingId === user._id}
                      onClick={() => applyPlan(user)}
                    >
                      {savingId === user._id ? 'Saving…' : 'Apply plan'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => removeUser(user._id, user.name)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {users.length === 0 && <p className="text-sm text-subtle">No users yet.</p>}
      </div>
    </div>
  );
}
