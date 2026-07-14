import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Link2,
  CopyPlus,
  ExternalLink,
  Globe,
  EyeOff,
  Trash,
  RotateCcw,
  Archive,
  Pencil,
} from 'lucide-react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { cn, generateSlug, getPortfolioViewPath, getPublicPortfolioUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DialogRoot, DialogTrigger, DialogContent } from '@/components/ui/Dialog';
import { FormField } from '@/components/ui/Label';
import type { PortfolioProfile } from '@/types';

type Tab = 'active' | 'bin';
type StatusFilter = 'all' | 'published' | 'draft';

export default function AdminProfilesPage() {
  const { profiles, refreshProfiles, setActiveProfileId } = useAdminProfile();
  const [tab, setTab] = useState<Tab>('active');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [binned, setBinned] = useState<PortfolioProfile[]>([]);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [slug, setSlug] = useState('');
  const [duplicateFromId, setDuplicateFromId] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [detailsProfile, setDetailsProfile] = useState<PortfolioProfile | null>(null);
  const [detailsName, setDetailsName] = useState('');
  const [detailsSlug, setDetailsSlug] = useState('');
  const [slugHint, setSlugHint] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);
  const navigate = useNavigate();

  const loadBin = useCallback(async () => {
    const items = await adminApi.getBinnedProfiles();
    setBinned(items);
  }, []);

  useEffect(() => {
    loadBin().catch(console.error);
  }, [loadBin, profiles]);

  const publishedCount = profiles.filter((p) => p.isPublished).length;
  const draftCount = profiles.filter((p) => !p.isPublished).length;

  const list = tab === 'active' ? profiles : binned;
  const filtered = list.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.displayName.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (tab !== 'active' || statusFilter === 'all') return true;
    if (statusFilter === 'published') return p.isPublished;
    return !p.isPublished;
  });

  useEffect(() => {
    if (displayName && !slug) setSlug(generateSlug(displayName));
  }, [displayName, slug]);

  useEffect(() => {
    if (!detailsProfile) return;
    const value = detailsSlug.trim().toLowerCase();
    if (!value || value === detailsProfile.slug) {
      setSlugHint('');
      return;
    }
    const t = window.setTimeout(() => {
      adminApi
        .checkSlug(value, detailsProfile._id)
        .then((r) => {
          if (!r.valid) setSlugHint('Use 3–60 chars: lowercase letters, numbers, hyphens.');
          else if (!r.available)
            setSlugHint('You already use this URL on another of your portfolios.');
          else if (r.liveTaken && detailsProfile.isPublished)
            setSlugHint('That URL is already live on another published portfolio.');
          else if (r.liveTaken)
            setSlugHint('Available for you as a draft — publishing needs a free public URL.');
          else setSlugHint('This URL is available.');
        })
        .catch(() => setSlugHint('Could not check slug.'));
    }, 300);
    return () => window.clearTimeout(t);
  }, [detailsSlug, detailsProfile]);

  const openDetails = (profile: PortfolioProfile) => {
    setDetailsProfile(profile);
    setDetailsName(profile.displayName);
    setDetailsSlug(profile.slug);
    setSlugHint('');
  };

  const saveDetails = async () => {
    if (!detailsProfile) return;
    setSavingDetails(true);
    try {
      const updated = await adminApi.updateProfile(detailsProfile._id, {
        displayName: detailsName.trim(),
        slug: detailsSlug.trim().toLowerCase(),
      });
      await refreshProfiles();
      if (updated._id) setActiveProfileId(updated._id);
      setDetailsProfile(null);
      toast.success(
        updated.slug !== detailsProfile.slug
          ? `URL updated to /${updated.slug}`
          : 'Portfolio details saved'
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save details');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleCreate = async () => {
    try {
      const profile = await adminApi.createProfile({
        displayName,
        slug: slug || undefined,
        duplicateFromId: duplicateFromId || undefined,
      });
      await refreshProfiles();
      setActiveProfileId(profile._id);
      setCreateOpen(false);
      setDisplayName('');
      setSlug('');
      setDuplicateFromId('');
      toast.success(`Draft created. Publish it when you’re ready — live URL: /${profile.slug}`);
      navigate('/dashboard/content');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create profile');
    }
  };

  const handleAction = async (
    action: 'publish' | 'duplicate' | 'bin' | 'restore' | 'permanent',
    profile: PortfolioProfile
  ) => {
    setBusyId(profile._id);
    try {
      switch (action) {
        case 'publish': {
          const next = !profile.isPublished;
          if (
            !next &&
            !confirm(
              `Unpublish “${profile.displayName}”? Visitors will no longer see the live page at /${profile.slug}.`
            )
          ) {
            return;
          }
          await adminApi.publishProfile(profile._id, next);
          toast.success(
            next
              ? `Published! Anyone with the link can view /${profile.slug}`
              : 'Moved back to Draft — no longer publicly visible'
          );
          break;
        }
        case 'duplicate': {
          const copy = await adminApi.duplicateProfile(profile._id);
          toast.success(`Duplicated as “${copy.displayName}” (draft)`);
          setTab('active');
          break;
        }
        case 'bin':
          if (
            !confirm(
              `Move “${profile.displayName}” to the Bin?\n\nYou can restore it later, or delete it permanently from the Bin.`
            )
          ) {
            return;
          }
          await adminApi.deleteProfile(profile._id);
          if (profiles.length <= 1) {
            /* active list refreshes; switcher updates via context */
          }
          toast.success('Moved to Bin');
          setTab('bin');
          break;
        case 'restore':
          await adminApi.restoreProfile(profile._id);
          toast.success('Restored — portfolio is a draft again');
          setTab('active');
          break;
        case 'permanent':
          if (
            !confirm(
              `Permanently delete “${profile.displayName}”?\n\nThis cannot be undone. All content for this portfolio will be removed.`
            )
          ) {
            return;
          }
          await adminApi.permanentlyDeleteProfile(profile._id);
          toast.success('Permanently deleted');
          break;
      }
      await refreshProfiles();
      await loadBin();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const copyLink = async (profile: PortfolioProfile) => {
    if (profile.isPublished) {
      await navigator.clipboard.writeText(getPublicPortfolioUrl(profile.slug));
      toast.success('Public link copied');
      return;
    }
    await navigator.clipboard.writeText(`${window.location.origin}${getPortfolioViewPath(profile)}`);
    toast.success('Preview link copied (login required)');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Portfolios</h1>
          <p className="text-sm text-subtle mt-1">
            Drafts stay private until you publish. Deleted portfolios go to the Bin first.
          </p>
        </div>
        <DialogRoot open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger>
            <Button>
              <Plus className="h-4 w-4" /> Create Profile
            </Button>
          </DialogTrigger>
          <DialogContent title="Create New Profile">
            <div className="space-y-4">
              <FormField label="Display Name">
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="John Doe"
                />
              </FormField>
              <FormField label="Slug (URL)">
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="john-doe"
                />
                <p className="text-xs text-subtle mt-1 font-mono">
                  Preview: {window.location.origin}/{slug || '...'}
                </p>
              </FormField>
              <FormField label="Duplicate from (optional)">
                <select
                  className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm"
                  value={duplicateFromId}
                  onChange={(e) => setDuplicateFromId(e.target.value)}
                >
                  <option value="">Start blank</option>
                  {profiles.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.displayName}
                    </option>
                  ))}
                </select>
              </FormField>
              <Button onClick={handleCreate} disabled={!displayName} className="w-full">
                Create as Draft
              </Button>
            </div>
          </DialogContent>
        </DialogRoot>
      </div>

      <DialogRoot
        open={!!detailsProfile}
        onOpenChange={(open) => {
          if (!open) setDetailsProfile(null);
        }}
      >
        <DialogContent title="Edit portfolio details">
          <div className="space-y-4">
            <FormField label="Display name">
              <Input
                value={detailsName}
                onChange={(e) => setDetailsName(e.target.value)}
                placeholder="Your name"
              />
            </FormField>
            <FormField label="URL slug">
              <Input
                value={detailsSlug}
                onChange={(e) => setDetailsSlug(e.target.value)}
                placeholder="your-name"
              />
              <p className="mt-1 text-xs font-mono text-subtle">
                {window.location.origin}/{detailsSlug || '…'}
              </p>
              {slugHint && (
                <p
                  className={cn(
                    'mt-1 text-xs',
                    slugHint.startsWith('This URL is available') ||
                      slugHint.startsWith('Available for you')
                      ? 'text-accent'
                      : 'text-red-400'
                  )}
                >
                  {slugHint}
                </p>
              )}
              <p className="mt-2 text-xs text-subtle">
                Within your account, each portfolio needs a unique slug. Other people can reuse the
                same slug as a draft; only one published site can own a public URL.
              </p>
            </FormField>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={saveDetails}
                disabled={
                  savingDetails ||
                  !detailsName.trim() ||
                  !detailsSlug.trim() ||
                  slugHint.includes('already use') ||
                  slugHint.includes('already live')
                }
              >
                {savingDetails ? 'Saving…' : 'Save details'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (!detailsProfile) return;
                  setActiveProfileId(detailsProfile._id);
                  setDetailsProfile(null);
                  navigate('/dashboard/content');
                }}
              >
                Edit content
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogRoot>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm border transition-colors',
              tab === 'active'
                ? 'border-accent/40 bg-accent/15 text-accent'
                : 'border-border text-secondary hover:bg-muted'
            )}
          >
            Active ({profiles.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('bin')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm border transition-colors',
              tab === 'bin'
                ? 'border-accent/40 bg-accent/15 text-accent'
                : 'border-border text-secondary hover:bg-muted'
            )}
          >
            <Trash className="h-3.5 w-3.5" />
            Bin ({binned.length})
          </button>
        </div>

        {tab === 'active' && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-subtle">Status</span>
            {(
              [
                { id: 'all', label: `All (${profiles.length})` },
                { id: 'published', label: `Published (${publishedCount})` },
                { id: 'draft', label: `Draft (${draftCount})` },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setStatusFilter(opt.id)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs border transition-colors',
                  statusFilter === opt.id
                    ? 'border-accent/40 bg-accent/15 text-accent'
                    : 'border-border text-secondary hover:bg-muted'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Input
        placeholder="Search by name or slug..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {tab === 'bin' && (
        <p className="text-sm text-subtle">
          Items in the Bin are unpublished and hidden from visitors. Restore to edit again, or delete
          permanently.
        </p>
      )}

      <div className="grid gap-3">
        {!filtered.length && (
          <Card className="text-sm text-subtle">
            {tab === 'bin' ? 'Bin is empty.' : 'No portfolios yet. Create your first profile.'}
          </Card>
        )}

        {filtered.map((profile) => {
          const busy = busyId === profile._id;
          const initials = profile.displayName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0]?.toUpperCase())
            .join('');

          if (tab === 'bin') {
            return (
              <Card key={profile._id} className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-subtle"
                    aria-hidden
                  >
                    {initials || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-primary">{profile.displayName}</h3>
                      <Badge variant="outline">In Bin</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-mono text-subtle">/{profile.slug}</p>
                    <p className="mt-1 text-xs text-subtle">
                      Deleted{' '}
                      {profile.deletedAt
                        ? new Date(profile.deletedAt).toLocaleString()
                        : 'recently'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button size="sm" disabled={busy} onClick={() => handleAction('restore', profile)}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy}
                      onClick={() => handleAction('permanent', profile)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete forever
                    </Button>
                  </div>
                </div>
              </Card>
            );
          }

          return (
            <Card key={profile._id} className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold',
                      profile.isPublished
                        ? 'bg-accent/20 text-accent'
                        : 'bg-muted text-subtle'
                    )}
                    aria-hidden
                  >
                    {initials || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-primary">{profile.displayName}</h3>
                      {profile.isDefault && <Badge variant="accent">Default</Badge>}
                      {profile.isPublished ? (
                        <Badge variant="accent">Published</Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                    <button
                      type="button"
                      className="mt-0.5 flex max-w-full items-center gap-1.5 rounded text-left text-xs font-mono text-subtle transition-colors hover:text-accent"
                      onClick={() => openDetails(profile)}
                      title="Edit URL slug"
                    >
                      <span className="truncate">/{profile.slug}</span>
                      <Pencil className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
                    </button>
                    <p className="mt-1 text-xs text-subtle">
                      {profile.isPublished ? 'Live for visitors' : 'Private draft'} · Updated{' '}
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      onClick={() => {
                        setActiveProfileId(profile._id);
                        navigate('/dashboard/content');
                      }}
                    >
                      Edit
                    </Button>
                    {profile.isPublished ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => handleAction('publish', profile)}
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        Unpublish
                      </Button>
                    ) : (
                      <Button size="sm" disabled={busy} onClick={() => handleAction('publish', profile)}>
                        <Globe className="h-3.5 w-3.5" />
                        Publish
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={getPortfolioViewPath(profile)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={profile.isPublished ? 'Open live site' : 'Open draft preview'}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        {profile.isPublished ? 'View' : 'Preview'}
                      </a>
                    </Button>
                  </div>

                  <div className="flex items-center gap-1 sm:justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => copyLink(profile)}
                      title="Copy public link"
                      aria-label="Copy public link"
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() => handleAction('duplicate', profile)}
                      title="Duplicate as draft"
                      aria-label="Duplicate as draft"
                    >
                      <CopyPlus className="h-4 w-4" />
                    </Button>
                    {!profile.isDefault && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => handleAction('bin', profile)}
                        title="Move to Bin"
                        aria-label="Move to Bin"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
