import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, RotateCcw, Save } from 'lucide-react';
import { platformApi } from '@/api';
import {
  createDemoGuestDraft,
  type GuestDraft,
} from '@/context/GuestDraftContext';
import {
  GuestDraftEditorFields,
  GUEST_DRAFT_SECTIONS,
  type GuestDraftSectionId,
} from '@/components/guest/GuestDraftEditorFields';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/apiError';
import { PORTFOLIO_THEME_LIST } from '@/themes/registry';

export default function PlatformTryDemoPage() {
  const [draft, setDraftState] = useState<GuestDraft | null>(null);
  const [section, setSection] = useState<GuestDraftSectionId>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setDraft = useCallback((updater: GuestDraft | ((prev: GuestDraft) => GuestDraft)) => {
    setDraftState((prev) => {
      if (!prev) return prev;
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const seed = await platformApi.getTryDemo();
        if (!cancelled) setDraftState(seed);
      } catch (err) {
        if (!cancelled) {
          setDraftState(createDemoGuestDraft());
          setError(errorMessage(err, 'Could not load try demo seed'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const saved = await platformApi.saveTryDemo(draft);
      setDraftState(saved);
      setMessage('Saved. Fresh /try visits and theme demos will use this seed.');
    } catch (err) {
      setError(errorMessage(err, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset the public /try demo to the default Alex Rivera seed?')) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const seed = await platformApi.resetTryDemo();
      setDraftState(seed);
      setMessage('Reset to default seed.');
    } catch (err) {
      setError(errorMessage(err, 'Reset failed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !draft) {
    return <div className="text-subtle font-mono text-sm">Loading try demo seed…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Try demo seed</h1>
          <p className="mt-1 text-sm text-subtle">
            Content shown on public{' '}
            <Link to="/try" className="text-accent hover:underline">
              /try
            </Link>{' '}
            and marketing theme cards. Visitors still edit their own local copy until they claim.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/try" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" /> Open /try
            </a>
          </Button>
          <Button variant="outline" size="sm" disabled={saving} onClick={handleReset}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset default
          </Button>
          <Button size="sm" disabled={saving} onClick={handleSave}>
            <Save className="h-3.5 w-3.5" /> {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {(message || error) && (
        <p className={cn('text-sm', error ? 'text-red-400' : 'text-accent')}>{error || message}</p>
      )}

      <div className="rounded-xl border border-border bg-elevated">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm text-subtle">
            Editing · <span className="font-medium text-primary">{draft.content.name}</span> ·{' '}
            {PORTFOLIO_THEME_LIST.find((t) => t.id === draft.themeId)?.name}
          </p>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-border px-3 py-2">
          {GUEST_DRAFT_SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-xs transition-colors',
                section === s.id
                  ? 'bg-brand-secondary/15 text-brand-secondary'
                  : 'text-secondary hover:bg-muted hover:text-primary'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="max-h-[min(70vh,720px)] space-y-3 overflow-y-auto p-4">
          <GuestDraftEditorFields draft={draft} setDraft={setDraft} section={section} />
        </div>
      </div>
    </div>
  );
}
