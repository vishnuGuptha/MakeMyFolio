import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Globe,
  EyeOff,
  ArrowRight,
  BarChart3,
  Briefcase,
  FolderKanban,
  Layers,
  Mail,
  Eye,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { AdminListSkeleton } from '@/components/admin/AdminEmptyState';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/apiError';
import { getPlan, normalizePlanId, previewUpgradeDue, formatMoney, resolveCheckoutCurrency } from '@/lib/plans';
import { cartCount, readCart, subscribeCart, DASHBOARD_CART_PATH } from '@/lib/planCheckout';
import { getPortfolioViewUrl, getPublicPortfolioLabel, cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { GoLivePaywall } from '@/components/billing/GoLivePaywall';
import type { DashboardReadiness, DashboardStats } from '@/types';

type ChecklistItem = {
  key: keyof DashboardReadiness;
  label: string;
  hint: string;
  to: string;
};

const CHECKLIST: ChecklistItem[] = [
  {
    key: 'hasBasics',
    label: 'Name & title',
    hint: 'Add your name and role on Profile & Hero',
    to: '/dashboard/content',
  },
  {
    key: 'hasBio',
    label: 'Bio or tagline',
    hint: 'A short intro helps visitors understand you',
    to: '/dashboard/content',
  },
  {
    key: 'hasProfileImage',
    label: 'Profile photo',
    hint: 'Upload a clear headshot',
    to: '/dashboard/content',
  },
  {
    key: 'hasResume',
    label: 'Resume',
    hint: 'PDF so visitors can download your CV',
    to: '/dashboard/content',
  },
  {
    key: 'hasSkills',
    label: 'Skills',
    hint: 'Add at least one skill category',
    to: '/dashboard/skills',
  },
  {
    key: 'hasExperience',
    label: 'Experience',
    hint: 'List a role or internship',
    to: '/dashboard/experience',
  },
  {
    key: 'hasProjects',
    label: 'Projects',
    hint: 'Showcase work with at least one project',
    to: '/dashboard/projects',
  },
  {
    key: 'hasEducation',
    label: 'Education',
    hint: 'Add a degree or school',
    to: '/dashboard/education',
  },
];

const STAT_ICONS: Record<string, LucideIcon> = {
  Projects: FolderKanban,
  Experience: Briefcase,
  Skills: Layers,
  Messages: Mail,
  'Views (7d)': Eye,
};

function formatRelativeTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diffSec = Math.round((Date.now() - t) / 1000);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  if (abs < 60) return rtf.format(-diffSec, 'second');
  const mins = Math.round(diffSec / 60);
  if (Math.abs(mins) < 60) return rtf.format(-mins, 'minute');
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 48) return rtf.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 14) return rtf.format(-days, 'day');
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function formatActivityLine(action: string, entity: string): string {
  const a = action.toLowerCase();
  const e = entity.toLowerCase();
  if (a === 'publish') return 'Published portfolio';
  if (a === 'unpublish') return 'Unpublished portfolio';
  if (a === 'update' && e === 'content') return 'Updated profile & hero';
  if (a === 'update' && e === 'settings') return 'Updated personalization';
  if (a === 'update' && e === 'profile') return 'Updated portfolio settings';
  if (a === 'create') return `Added ${e}`;
  if (a === 'delete' || a === 'bin') return `Removed ${e}`;
  if (a === 'restore') return `Restored ${e}`;
  return `${action} ${entity}`.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminDashboardPage() {
  const { activeProfile, profiles, refreshProfiles } = useAdminProfile();
  const { user } = useAuth();
  const canPublish = Boolean(user?.limits?.canPublish);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [goLiveOpen, setGoLiveOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const navigate = useNavigate();

  const planId = normalizePlanId(user?.plan);
  const planName = getPlan(planId).name;
  const maxPortfolios = user?.limits?.maxPortfolios ?? 1;
  const folioCount = profiles?.length ?? 0;
  const isFreePlan = planId === 'free';
  const isPaidPlan = planId === 'pro' || planId === 'premium' || planId === 'domain';

  const planUsageLine = useMemo(() => {
    const parts: string[] = [
      `${folioCount} / ${maxPortfolios} portfolio${maxPortfolios === 1 ? '' : 's'}`,
    ];
    if (isFreePlan) {
      parts.push(canPublish ? 'publish unlocked' : 'draft only');
      const importLimit = user?.limits?.maxResumeImports;
      if (importLimit === 1) {
        parts.push(user?.resumeImportUsed ? 'resume import used' : '1 resume import left');
      }
    } else if (isPaidPlan) {
      parts.push(canPublish ? 'publish unlocked' : 'publish locked');
      if (user?.planBilling) {
        parts.push(user.planBilling === 'yearly' ? 'yearly' : 'monthly');
      }
      if (user?.limits?.customDomain) {
        parts.push('custom domain');
      } else if (planId === 'pro' || planId === 'premium') {
        parts.push('subdomain');
      }
    }
    return parts.join(' · ');
  }, [
    folioCount,
    maxPortfolios,
    isFreePlan,
    isPaidPlan,
    canPublish,
    user?.limits?.maxResumeImports,
    user?.limits?.customDomain,
    user?.resumeImportUsed,
    user?.planBilling,
    planId,
  ]);

  const planCta = useMemo(() => {
    if (planId === 'premium' || planId === 'domain') {
      return { label: 'View plan', to: '/dashboard/pricing' as const };
    }
    if (planId === 'pro') {
      return { label: 'Upgrade', to: '/dashboard/pricing?upgrade=1' as const };
    }
    return { label: 'Upgrade plan', to: '/dashboard/pricing' as const };
  }, [planId]);

  const [savedCount, setSavedCount] = useState(() => cartCount());
  useEffect(() => subscribeCart(() => setSavedCount(cartCount())), []);

  const abandonedCheckout = useMemo(() => {
    if (savedCount <= 0) return null;
    const item = readCart().find((i) => i.planId !== 'domain');
    if (!item) return null;
    const due = previewUpgradeDue({
      currentPlan: planId,
      targetPlan: item.planId,
      billing: item.billing,
      currency: resolveCheckoutCurrency(item.currency),
      currentBilling: user?.planBilling,
      currentCurrency: user?.planCurrency,
    });
    if (!due.ok) return null;
    const name = getPlan(item.planId).name;
    const amount = formatMoney(due.amountMajor, resolveCheckoutCurrency(item.currency));
    return {
      /** Hero line — amount first */
      label: `${amount} left on ${name}`,
      detail: `Finish ${name} ${item.billing === 'yearly' ? 'yearly' : 'monthly'} checkout when ready.`,
      to: `${DASHBOARD_CART_PATH}?highlight=checkout` as const,
    };
  }, [savedCount, planId, user?.planBilling, user?.planCurrency]);

  const load = () => {
    if (!activeProfile) return;
    setLoading(true);
    adminApi
      .getDashboard(activeProfile._id)
      .then(setStats)
      .catch((err) => toast.error(errorMessage(err, 'Failed to load dashboard')))
      .finally(() => setLoading(false));
  };

  useEffect(load, [activeProfile]);

  const readiness = stats?.readiness;
  const doneCount = useMemo(() => {
    if (!readiness) return 0;
    return CHECKLIST.filter((c) => readiness[c.key]).length;
  }, [readiness]);

  const missing = useMemo(() => {
    if (!readiness) return CHECKLIST;
    return CHECKLIST.filter((c) => !readiness[c.key]);
  }, [readiness]);

  const isPublished = stats?.isPublished ?? activeProfile?.isPublished ?? false;
  const slug = stats?.slug ?? activeProfile?.slug ?? '';
  const previewHref = activeProfile
    ? getPortfolioViewUrl({
        _id: activeProfile._id,
        slug,
        isPublished,
      })
    : '#';

  /** Free / locked users need one clear path to go live — resume saved checkout wins over a new paywall. */
  const needsGoLive = !canPublish && !isPublished;
  const primaryGoLive = useMemo(() => {
    if (!needsGoLive) return null;
    if (abandonedCheckout) {
      return {
        kind: 'continue' as const,
        label: 'Continue checkout',
        ariaLabel: `Continue ${abandonedCheckout.label}`,
        to: abandonedCheckout.to,
        hint: abandonedCheckout.label,
      };
    }
    return {
      kind: 'paywall' as const,
      label: 'Upgrade to go live',
      ariaLabel: 'Upgrade to go live',
      hint: 'Unlock publishing with Pro or Premium.',
    };
  }, [needsGoLive, abandonedCheckout]);

  /** Saved checkout for users who can already publish (don't compete with go-live). */
  const leftoverCheckout = !needsGoLive ? abandonedCheckout : null;

  const viewsLast7Days = stats?.viewsLast7Days ?? 0;
  const viewsByDay = stats?.viewsByDay;
  const hasAnyViews = viewsLast7Days > 0;

  const openGoLive = () => setGoLiveOpen(true);

  const folioReady = Boolean(stats && missing.length === 0);

  const billingStrip = primaryGoLive?.kind === 'continue' ? (
    <Card className="flex flex-col gap-3 border-[#0066FF]/25 bg-[#0066FF]/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-base font-semibold tracking-tight text-primary">{primaryGoLive.hint}</p>
        <p className="mt-0.5 text-xs text-subtle">
          {abandonedCheckout?.detail || 'Finish checkout to publish this folio.'} You’re on Free (
          {planUsageLine}).
        </p>
      </div>
      <Button size="sm" className="home-cta-primary shrink-0 border-0 shadow-none" asChild>
        <Link to={primaryGoLive.to} aria-label={primaryGoLive.ariaLabel}>
          {primaryGoLive.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </Button>
    </Card>
  ) : primaryGoLive?.kind === 'paywall' ? (
    <Card className="flex flex-col gap-3 border-accent/25 bg-accent/5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-primary">You’re on the Basic (Free) plan</p>
        <p className="mt-0.5 text-xs text-subtle">{planUsageLine}</p>
        <p className="mt-1 text-xs text-subtle">{primaryGoLive.hint}</p>
      </div>
      <Button
        size="sm"
        className="home-cta-primary shrink-0 border-0 shadow-none"
        onClick={openGoLive}
        aria-label={primaryGoLive.ariaLabel}
      >
        {primaryGoLive.label}
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </Card>
  ) : (
    <>
      {leftoverCheckout ? (
        <Card className="flex flex-col gap-3 border-[#0066FF]/25 bg-[#0066FF]/5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-primary">
              {leftoverCheckout.label}
            </p>
            <p className="mt-0.5 text-xs text-subtle">{leftoverCheckout.detail}</p>
          </div>
          <Button size="sm" className="home-cta-primary shrink-0 border-0 shadow-none" asChild>
            <Link to={leftoverCheckout.to} aria-label="Continue saved plan checkout">
              Continue checkout
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </Card>
      ) : null}
      <Card className="flex flex-col gap-3 border-accent/25 bg-accent/5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">
            {isFreePlan ? 'You’re on the Basic (Free) plan' : `You’re on the ${planName} plan`}
          </p>
          <p className="mt-0.5 text-xs text-subtle">{planUsageLine}</p>
          {folioCount >= maxPortfolios ? (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
              Portfolio limit reached
              {planId === 'pro' ? ' — upgrade to Premium for more.' : '.'}
            </p>
          ) : null}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => navigate(planCta.to)}
        >
          {planCta.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Card>
    </>
  );

  const togglePublish = async () => {
    if (!activeProfile) return;
    const next = !isPublished;
    if (next && !canPublish) {
      setGoLiveOpen(true);
      return;
    }
    if (!next && !confirm(`Unpublish “${activeProfile.displayName}”? Visitors will lose the live page.`)) {
      return;
    }
    setPublishing(true);
    try {
      await adminApi.publishProfile(activeProfile._id, next);
      await refreshProfiles();
      load();
      toast.success(next ? 'Published! Your portfolio is live.' : 'Unpublished — now a private draft.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update publish status'));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <RequireActiveProfile>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
            <p className="text-sm text-subtle mt-1">
              Publish readiness for{' '}
              <span className="text-accent">{activeProfile?.displayName}</span>
            </p>
          </div>
          {stats && (
            <Badge variant={isPublished ? 'accent' : 'outline'} className="self-start">
              {isPublished ? 'Live' : 'Draft'}
            </Badge>
          )}
        </div>

        {/* When checklist is complete, readiness comes first; otherwise billing leads. */}
        {!folioReady ? billingStrip : null}

        {loading && <AdminListSkeleton rows={4} />}

        {!loading && stats && (
          <>
            <Card
              className={cn(
                'space-y-3',
                missing.length === 0 && 'border-emerald-500/25 bg-emerald-500/[0.04]'
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">
                    {missing.length === 0
                      ? isPublished
                        ? 'Your folio is complete and live'
                        : 'Your folio is ready'
                      : isPublished
                        ? 'Your portfolio is live'
                        : 'This portfolio is a draft'}
                  </p>
                  <p className="mt-1 font-mono text-xs text-subtle">
                    {slug ? getPublicPortfolioLabel(slug) : ''}
                  </p>
                  <p className="mt-2 text-xs text-subtle">
                    {missing.length === 0 ? (
                      <>
                        Checklist complete ({doneCount}/{CHECKLIST.length})
                        {needsGoLive
                          ? ' — upgrade above to publish a live link.'
                          : isPublished
                            ? ' — share your link anytime from the header.'
                            : ' — publish when you’re ready.'}
                      </>
                    ) : (
                      <>
                        {doneCount}/{CHECKLIST.length} checklist items complete
                        {!isPublished ? ' — fill the gaps below, then preview and publish.' : '.'}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Preview lives in the header — avoid a second Preview here. */}
                  {needsGoLive ? null : (
                    <Button size="sm" disabled={publishing} onClick={togglePublish}>
                      {isPublished ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" />
                          {publishing ? 'Updating…' : 'Unpublish'}
                        </>
                      ) : (
                        <>
                          <Globe className="h-3.5 w-3.5" />
                          {publishing ? 'Publishing…' : 'Publish'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    missing.length === 0 ? 'bg-emerald-500' : 'bg-accent'
                  )}
                  style={{ width: `${(doneCount / CHECKLIST.length) * 100}%` }}
                />
              </div>
            </Card>

            {folioReady ? billingStrip : null}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {(
                [
                  { label: 'Projects', value: stats.projects, to: '/dashboard/projects' },
                  { label: 'Experience', value: stats.experiences, to: '/dashboard/experience' },
                  { label: 'Skills', value: stats.skills, to: '/dashboard/skills' },
                  {
                    label: 'Messages',
                    value: stats.unreadMessages,
                    to: '/dashboard/messages',
                    badge: stats.unreadMessages > 0,
                  },
                ] as const
              ).map((s) => {
                const Icon = STAT_ICONS[s.label];
                return (
                  <Link key={s.label} to={s.to} className="min-w-0">
                    <Card className="relative h-full px-3 py-3.5 text-center transition-colors hover:border-accent/40">
                      {'badge' in s && s.badge ? (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#0066FF]" aria-hidden />
                      ) : null}
                      {Icon ? (
                        <Icon className="mx-auto mb-1.5 h-3.5 w-3.5 text-subtle" aria-hidden />
                      ) : null}
                      <p className="text-3xl font-bold tabular-nums text-accent">{s.value}</p>
                      <p className="mt-1 text-xs text-subtle">{s.label}</p>
                    </Card>
                  </Link>
                );
              })}
              {(() => {
                const Icon = STAT_ICONS['Views (7d)'];
                const viewsCard = (
                  <Card
                    className={cn(
                      'relative h-full px-3 py-3.5 text-center transition-colors',
                      (isPublished || primaryGoLive) && 'hover:border-accent/40',
                      primaryGoLive && !isPublished && 'cursor-pointer'
                    )}
                  >
                    {Icon ? (
                      <Icon className="mx-auto mb-1.5 h-3.5 w-3.5 text-subtle" aria-hidden />
                    ) : null}
                    <p className="text-3xl font-bold tabular-nums text-accent">{viewsLast7Days}</p>
                    <p className="mt-1 text-xs text-subtle">Views (7d)</p>
                    {primaryGoLive && !isPublished ? (
                      <p className="mt-1 text-[10px] text-[#0066FF]">Go live to track</p>
                    ) : null}
                  </Card>
                );
                if (isPublished) {
                  return (
                    <a href={previewHref} target="_blank" rel="noreferrer" className="min-w-0">
                      {viewsCard}
                    </a>
                  );
                }
                return (
                  <button
                    type="button"
                    className="min-w-0 text-left"
                    onClick={() => {
                      if (primaryGoLive?.kind === 'continue') navigate(primaryGoLive.to);
                      else if (primaryGoLive?.kind === 'paywall') openGoLive();
                    }}
                    aria-label={
                      primaryGoLive
                        ? `${primaryGoLive.ariaLabel} to start tracking views`
                        : 'Views last 7 days — publish to track'
                    }
                  >
                    {viewsCard}
                  </button>
                );
              })()}
            </div>

            <Card>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold text-primary">Views · last 7 days</h2>
                {hasAnyViews && isPublished ? (
                  <p className="text-xs text-subtle">Counted when someone opens your live folio</p>
                ) : null}
              </div>
              {!isPublished || !hasAnyViews ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#0066FF]/20 bg-muted/30 px-4 py-8 text-center">
                  <BarChart3 className="h-8 w-8 text-subtle/60" aria-hidden />
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {!isPublished ? 'No views yet — folio is still a draft' : 'No views in the last 7 days'}
                    </p>
                    <p className="mt-1 text-xs text-subtle">
                      {!isPublished
                        ? 'Go live to start collecting visitor counts here.'
                        : 'Share your live link to start seeing traffic.'}
                    </p>
                  </div>
                  {!isPublished && primaryGoLive?.kind === 'continue' ? (
                    <Button size="sm" className="home-cta-primary border-0 shadow-none" asChild>
                      <Link to={primaryGoLive.to} aria-label={primaryGoLive.ariaLabel}>
                        {primaryGoLive.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  ) : !isPublished && primaryGoLive?.kind === 'paywall' ? (
                    <Button
                      size="sm"
                      className="home-cta-primary border-0 shadow-none"
                      onClick={openGoLive}
                      aria-label={primaryGoLive.ariaLabel}
                    >
                      {primaryGoLive.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : isPublished ? (
                    <Button size="sm" variant="outline" asChild>
                      <a href={previewHref} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open live link
                      </a>
                    </Button>
                  ) : null}
                </div>
              ) : (
                (() => {
                  const days = viewsByDay || [];
                  const max = Math.max(1, ...days.map((d) => d.count));
                  return (
                    <div className="relative pt-1">
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-5 top-1 border-b border-dashed border-[#0066FF]/15"
                        aria-hidden
                      />
                      <div className="relative flex h-28 items-end gap-2">
                        {days.map((d) => {
                          const heightPct = Math.round((d.count / max) * 100);
                          const weekday = new Date(`${d.date}T12:00:00Z`).toLocaleDateString(
                            undefined,
                            { weekday: 'short', timeZone: 'UTC' }
                          );
                          const dateLabel = new Date(`${d.date}T12:00:00Z`).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric', timeZone: 'UTC' }
                          );
                          return (
                            <div
                              key={d.date}
                              className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
                              title={`${dateLabel}: ${d.count} view${d.count === 1 ? '' : 's'}`}
                            >
                              <span className="text-[10px] font-medium tabular-nums text-subtle opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                {d.count}
                              </span>
                              <div className="flex w-full flex-1 items-end">
                                <div
                                  className="w-full rounded-t bg-accent/80 transition-[height] group-hover:bg-accent"
                                  style={{
                                    height: `${Math.max(heightPct, d.count > 0 ? 10 : 0)}%`,
                                    minHeight: d.count > 0 ? 6 : 0,
                                  }}
                                />
                              </div>
                              <span className="w-full truncate text-center text-[10px] text-subtle">
                                {weekday}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              )}
            </Card>

            {missing.length > 0 ? (
              <Card>
                <h2 className="mb-3 font-semibold text-primary">What’s missing</h2>
                <ul className="space-y-2">
                  {missing.map((item) => (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => navigate(item.to)}
                        className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                      >
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                        <span className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-primary">{item.label}</span>
                          <span className="block text-xs text-subtle">{item.hint}</span>
                        </span>
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            ) : (
              <Card className="border-emerald-500/20">
                <h2 className="mb-2 font-semibold text-primary">Next steps</h2>
                <p className="mb-3 flex items-start gap-2 text-sm text-subtle">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Everything on the checklist is done.
                    {needsGoLive
                      ? ' Finish upgrade above to go live, or preview from the header.'
                      : isPublished
                        ? ' Share your live link from the header Copy button.'
                        : ' Preview from the header, then hit Publish when ready.'}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={previewHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={isPublished ? 'View live portfolio' : 'Preview draft portfolio'}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      {isPublished ? 'View live' : 'Open preview'}
                    </a>
                  </Button>
                  {primaryGoLive?.kind === 'continue' ? (
                    <Button size="sm" className="home-cta-primary border-0 shadow-none" asChild>
                      <Link to={primaryGoLive.to}>{primaryGoLive.label}</Link>
                    </Button>
                  ) : primaryGoLive?.kind === 'paywall' ? (
                    <Button
                      size="sm"
                      className="home-cta-primary border-0 shadow-none"
                      onClick={openGoLive}
                    >
                      {primaryGoLive.label}
                    </Button>
                  ) : null}
                </div>
              </Card>
            )}

            {stats.activity.length > 0 && (
              <Card className="!p-0 overflow-hidden">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/50"
                  onClick={() => setActivityOpen((o) => !o)}
                  aria-expanded={activityOpen}
                >
                  <h3 className="font-semibold text-primary">
                    Recent activity
                    <span className="ml-2 text-xs font-normal text-subtle">
                      ({stats.activity.length})
                    </span>
                  </h3>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-subtle transition-transform',
                      activityOpen && 'rotate-180'
                    )}
                  />
                </button>
                {activityOpen ? (
                  <div className="space-y-2 border-t border-border/60 px-4 py-3">
                    {stats.activity.map((a, i) => (
                      <div key={i} className="flex justify-between gap-4 text-sm">
                        <span className="text-secondary">{formatActivityLine(a.action, a.entity)}</span>
                        <span
                          className="shrink-0 text-xs text-subtle"
                          title={new Date(a.timestamp).toLocaleString()}
                        >
                          {formatRelativeTime(a.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </Card>
            )}
          </>
        )}
      </div>
      <GoLivePaywall
        open={goLiveOpen}
        onOpenChange={setGoLiveOpen}
        onPaid={() => {
          void refreshProfiles();
          load();
        }}
      />
    </RequireActiveProfile>
  );
}
