import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, PanelRightClose, PanelRightOpen, Upload, Eye, Monitor, Smartphone, Tablet } from 'lucide-react';
import {
  useGuestDraft,
  writeGuestPreviewSnapshot,
} from '@/context/GuestDraftContext';
import { PORTFOLIO_THEME_LIST } from '@/themes/registry';
import type { PortfolioThemeId } from '@/themes/types';
import { DeviceThemePreview, type DeviceMode } from '@/components/marketing/DeviceThemePreview';
import {
  GuestDraftEditorFields,
  GUEST_DRAFT_SECTIONS,
  type GuestDraftSectionId,
} from '@/components/guest/GuestDraftEditorFields';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { resetDocumentThemeForAdmin } from '@/lib/theme';
import { buildExampleGuestDraft, getExampleById } from '@/lib/exampleFolios';

const THEME_IDS = new Set(PORTFOLIO_THEME_LIST.map((t) => t.id));

export default function TryEditorPage() {
  const { draft, setDraft, requireAuth } = useGuestDraft();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [section, setSection] = useState<GuestDraftSectionId>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    resetDocumentThemeForAdmin();
  }, [draft.themeId]);

  // Apply ?example= remix or ?theme= from gallery links
  useEffect(() => {
    const exampleId = params.get('example');
    const example = getExampleById(exampleId);
    if (example) {
      setDraft(buildExampleGuestDraft(example));
      return;
    }
    const raw = params.get('theme');
    if (!raw || !THEME_IDS.has(raw as PortfolioThemeId)) return;
    const themeId = raw as PortfolioThemeId;
    setDraft((prev) => {
      if (prev.themeId === themeId) return prev;
      return {
        ...prev,
        themeId,
        updatedAt: new Date().toISOString(),
      };
    });
  }, [params, setDraft]);

  const openFullPreview = () => {
    writeGuestPreviewSnapshot(draft);
    const popup = window.open('/try/preview', '_blank');
    if (!popup) navigate('/try/preview');
  };

  return (
    <main className="relative flex h-[calc(100svh-4rem)] overflow-hidden">
      {/* Homepage-style atmosphere */}
      <div className="try-editor-atmosphere" aria-hidden>
        <div className="home-mesh-gradient absolute inset-0" />
        <div className="home-mesh-secondary absolute inset-0" />
        <div className="home-orb home-orb-blue absolute -left-24 top-[8%] h-72 w-72 rounded-full opacity-70" />
        <div className="home-orb home-orb-cyan absolute -right-20 top-[18%] h-80 w-80 rounded-full opacity-60" />
        <div className="home-orb home-orb-indigo absolute bottom-[12%] left-[30%] h-56 w-56 rounded-full opacity-50" />
        <div className="home-scene-vignette absolute inset-0" />
      </div>

      <div
        className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overscroll-none p-3 sm:p-4"
        onWheel={(e) => e.stopPropagation()}
      >
        <div className="try-editor-toolbar mb-3 flex shrink-0 flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
              Live preview
            </p>
            <div className="try-editor-device-shell">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={cn(
                  'try-editor-chip inline-flex items-center gap-1.5 px-2.5 py-1 text-xs',
                  device === 'desktop' && 'try-editor-chip-active'
                )}
                aria-pressed={device === 'desktop'}
              >
                <Monitor className="h-3.5 w-3.5" /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice('tablet')}
                className={cn(
                  'try-editor-chip inline-flex items-center gap-1.5 px-2.5 py-1 text-xs',
                  device === 'tablet' && 'try-editor-chip-active'
                )}
                aria-pressed={device === 'tablet'}
              >
                <Tablet className="h-3.5 w-3.5" /> iPad
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={cn(
                  'try-editor-chip inline-flex items-center gap-1.5 px-2.5 py-1 text-xs',
                  device === 'mobile' && 'try-editor-chip-active'
                )}
                aria-pressed={device === 'mobile'}
              >
                <Smartphone className="h-3.5 w-3.5" /> Mobile
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="home-cta-secondary h-7 text-xs"
              onClick={openFullPreview}
            >
              <Eye className="h-3.5 w-3.5" /> Full view
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="home-cta-secondary h-8 text-xs"
              onClick={() => requireAuth('import')}
            >
              <Upload className="h-3.5 w-3.5" /> Sign in to import
            </Button>
            <Button
              size="sm"
              className="home-cta-primary h-8 border-0 text-xs hover:bg-transparent"
              onClick={() => requireAuth('publish')}
            >
              <Globe className="h-3.5 w-3.5" /> Sign in to publish
            </Button>
            <Button
              variant={sidebarOpen ? 'ghost' : 'default'}
              size="sm"
              className={cn(
                'h-8 text-xs',
                sidebarOpen ? 'home-cta-secondary' : 'home-cta-primary border-0 hover:bg-transparent'
              )}
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

        <div className="try-editor-stage relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="try-editor-stage-glow" aria-hidden />
          <div
            className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-br from-[#0066FF]/25 via-indigo-500/15 to-cyan-400/20 blur-3xl opacity-80"
            aria-hidden
          />
          <DeviceThemePreview
            draft={draft}
            device={device}
            className="relative z-10 min-h-0 flex-1 p-3 sm:p-4"
          />
        </div>
      </div>

      <aside
        className={cn(
          'relative z-10 flex h-full shrink-0 flex-col py-3 pr-3 transition-[width,opacity] duration-200 ease-out',
          sidebarOpen ? 'w-[min(100vw,360px)] opacity-100' : 'w-0 overflow-hidden opacity-0'
        )}
        aria-hidden={!sidebarOpen}
      >
        <div
          className={cn(
            'try-editor-panel-float flex h-full min-h-0 w-[min(100vw,348px)] flex-col overflow-hidden',
            !sidebarOpen && 'pointer-events-none invisible'
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#0066FF]/12 px-3.5 py-3 dark:border-white/10">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
                Editor
              </p>
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

          <div className="flex shrink-0 flex-wrap gap-1 border-b border-[#0066FF]/10 px-2.5 py-2 dark:border-white/10">
            {GUEST_DRAFT_SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={cn(
                  'try-editor-chip shrink-0 px-2.5 py-1.5 text-xs',
                  section === s.id && 'try-editor-chip-active'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="try-editor-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3.5">
            <GuestDraftEditorFields draft={draft} setDraft={setDraft} section={section} />
          </div>

          <div className="shrink-0 border-t border-[#0066FF]/10 bg-[#0066FF]/[0.04] px-3.5 py-3 text-xs text-subtle dark:border-white/10 dark:bg-white/[0.03]">
            Draft saves in this browser.{' '}
            <button
              type="button"
              className="font-medium text-[#0066FF] hover:underline"
              onClick={() => requireAuth('persist')}
            >
              Create an account
            </button>{' '}
            to keep it forever and publish.
          </div>
        </div>
      </aside>
    </main>
  );
}
