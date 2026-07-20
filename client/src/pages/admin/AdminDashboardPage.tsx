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
} from 'lucide-react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { AdminListSkeleton } from '@/components/admin/AdminEmptyState';
import { errorMessage } from '@/lib/apiError';
import { getPortfolioViewUrl, getPublicPortfolioLabel } from '@/lib/utils';
import { BRAND } from '@/brand/constants';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
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

export default function AdminDashboardPage() {
  const { activeProfile, refreshProfiles } = useAdminProfile();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();

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

  const togglePublish = async () => {
    if (!activeProfile) return;
    const next = !isPublished;
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
      <div className="space-y-6 max-w-4xl">
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

        <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-accent/25 bg-accent/5">
          <div>
            <p className="text-sm font-medium text-primary">You&apos;re on the Free plan</p>
            <p className="text-xs text-subtle mt-0.5">
              1 folio · core themes · upgrade for more portfolios &amp; Pro themes (billing soon).
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => toast.message(`Pro waitlist — billing is coming soon on ${BRAND.name}.`)}
          >
            Explore Pro
          </Button>
        </Card>

        {loading && <AdminListSkeleton rows={4} />}

        {!loading && stats && (
          <>
            <Card className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">
                    {isPublished ? 'Your portfolio is live' : 'This portfolio is a draft'}
                  </p>
                  <p className="text-xs text-subtle font-mono mt-1">{slug ? getPublicPortfolioLabel(slug) : ''}</p>
                  <p className="text-xs text-subtle mt-2">
                    {doneCount}/{CHECKLIST.length} checklist items complete
                    {missing.length > 0 && !isPublished
                      ? ' — fill the gaps below, then preview and publish.'
                      : '.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <a href={previewHref} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      {isPublished ? 'View live' : 'Preview'}
                    </a>
                  </Button>
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
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${(doneCount / CHECKLIST.length) * 100}%` }}
                />
              </div>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Projects', value: stats.projects, to: '/dashboard/projects' },
                { label: 'Experience', value: stats.experiences, to: '/dashboard/experience' },
                { label: 'Skills', value: stats.skills, to: '/dashboard/skills' },
                { label: 'Messages', value: stats.unreadMessages, to: '/dashboard/messages' },
              ].map((s) => (
                <Link key={s.label} to={s.to}>
                  <Card className="text-center hover:border-accent/40 transition-colors h-full">
                    <p className="text-3xl font-bold text-accent">{s.value}</p>
                    <p className="text-xs font-mono text-subtle mt-1">{s.label}</p>
                  </Card>
                </Link>
              ))}
            </div>

            <Card>
              <h2 className="font-semibold text-primary mb-3">What’s missing</h2>
              {missing.length === 0 ? (
                <p className="text-sm text-subtle flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Looking good — preview your site, then publish when you’re ready.
                </p>
              ) : (
                <ul className="space-y-2">
                  {missing.map((item) => (
                    <li key={item.key}>
                      <button
                        type="button"
                        onClick={() => navigate(item.to)}
                        className="w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted transition-colors"
                      >
                        <Circle className="h-4 w-4 text-subtle mt-0.5 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-primary">{item.label}</span>
                          <span className="block text-xs text-subtle">{item.hint}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 text-subtle shrink-0 mt-0.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {stats.activity.length > 0 && (
              <Card>
                <h3 className="font-semibold mb-3">Recent activity</h3>
                <div className="space-y-2">
                  {stats.activity.map((a, i) => (
                    <div key={i} className="flex justify-between text-sm gap-4">
                      <span className="text-secondary capitalize">
                        {a.action} {a.entity}
                      </span>
                      <span className="text-subtle font-mono text-xs shrink-0">
                        {new Date(a.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </RequireActiveProfile>
  );
}
