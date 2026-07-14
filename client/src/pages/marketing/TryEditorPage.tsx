import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Globe, PanelRightClose, PanelRightOpen, Upload, Eye, Monitor, Smartphone } from 'lucide-react';
import {
  useGuestDraft,
  writeGuestPreviewSnapshot,
} from '@/context/GuestDraftContext';
import { PORTFOLIO_THEME_LIST } from '@/themes/registry';
import { DeviceThemePreview } from '@/components/marketing/DeviceThemePreview';
import {
  GuestDraftEditorFields,
  GUEST_DRAFT_SECTIONS,
  type GuestDraftSectionId,
} from '@/components/guest/GuestDraftEditorFields';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { resetDocumentThemeForAdmin } from '@/lib/theme';

export default function TryEditorPage() {
  const { draft, setDraft, requireAuth } = useGuestDraft();
  const navigate = useNavigate();
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [section, setSection] = useState<GuestDraftSectionId>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    resetDocumentThemeForAdmin();
  }, [draft.themeId]);

  const openFullPreview = () => {
    writeGuestPreviewSnapshot(draft);
    const popup = window.open('/try/preview', '_blank');
    if (!popup) navigate('/try/preview');
  };

  return (
    <main className="relative flex h-[calc(100svh-4rem)] overflow-hidden">
      <div
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overscroll-none px-3 py-3 sm:px-5"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">
              Live preview
            </p>
            <div className="flex rounded-md border border-border bg-elevated p-0.5">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors',
                  device === 'desktop'
                    ? 'bg-muted text-primary'
                    : 'text-subtle hover:text-primary'
                )}
                aria-pressed={device === 'desktop'}
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors',
                  device === 'mobile' ? 'bg-muted text-primary' : 'text-subtle hover:text-primary'
                )}
                aria-pressed={device === 'mobile'}
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={openFullPreview}
            >
              <Eye className="h-3.5 w-3.5" /> Full view
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => requireAuth('import')}
            >
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => requireAuth('publish')}>
              <Globe className="h-3.5 w-3.5" /> Publish
            </Button>
            <Button
              variant={sidebarOpen ? 'outline' : 'default'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-pressed={sidebarOpen}
            >
              {sidebarOpen ? (
                <PanelRightClose className="h-3.5 w-3.5" />
              ) : (
                <PanelRightOpen className="h-3.5 w-3.5" />
              )}
              {sidebarOpen ? 'Hide editor' : 'Edit'}
            </Button>
          </div>
        </div>

        <DeviceThemePreview draft={draft} device={device} className="min-h-0 flex-1" />
      </div>

      <aside
        className={cn(
          'flex h-full shrink-0 flex-col border-l border-border bg-base/95 shadow-xl backdrop-blur-md transition-[width] duration-200 ease-out',
          sidebarOpen ? 'w-[min(100vw,340px)]' : 'w-0 border-l-0'
        )}
        aria-hidden={!sidebarOpen}
      >
        <div
          className={cn(
            'flex h-full min-h-0 w-[min(100vw,340px)] flex-col',
            !sidebarOpen && 'pointer-events-none invisible'
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-primary">Editor</p>
              <p className="truncate text-[11px] text-subtle">
                {draft.content.name || 'Your name'} ·{' '}
                {PORTFOLIO_THEME_LIST.find((t) => t.id === draft.themeId)?.name}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 px-2"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close editor"
            >
              <PanelRightClose className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex shrink-0 flex-wrap gap-1 border-b border-border px-2 py-1.5">
            {GUEST_DRAFT_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={cn(
                  'shrink-0 rounded-md px-2.5 py-1.5 text-xs transition-colors',
                  section === s.id
                    ? 'bg-accent/15 text-accent'
                    : 'text-secondary hover:bg-muted hover:text-primary'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="try-editor-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3">
            <GuestDraftEditorFields draft={draft} setDraft={setDraft} section={section} />
          </div>

          <div className="shrink-0 border-t border-border px-3 py-2.5 text-xs text-subtle">
            Guest draft clears on refresh.{' '}
            <button
              type="button"
              className="text-accent hover:underline"
              onClick={() => requireAuth('persist')}
            >
              Create an account
            </button>{' '}
            or{' '}
            <Link to="/register?claimGuest=1" className="text-accent hover:underline">
              register
            </Link>
            .
          </div>
        </div>
      </aside>
    </main>
  );
}
