import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Palette } from 'lucide-react';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { UnsavedChangesBar } from '@/components/admin/UnsavedChangesBar';
import { useUnsavedForm } from '@/hooks/useUnsavedForm';
import { errorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { GenerateWithAiButton, AiFieldLabel } from '@/components/admin/GenerateWithAiButton';
import { Badge } from '@/components/ui/Badge';
import { FONT_OPTIONS, PORTFOLIO_NAV_SECTIONS, COLOR_PALETTE_OPTIONS, findMatchingColorPalette } from '@/lib/theme';
import { getPortfolioTheme } from '@/themes/registry';
import { CURSOR_EFFECT_OPTIONS } from '@/themes/shared/cursorEffects';
import ThemePreviewMini from '@/components/admin/ThemePreviewMini';
import { MediaPickerField } from '@/components/admin/MediaPickerField';
import type { SiteSettings } from '@/types';

const defaults: SiteSettings = {
  siteTitle: '',
  metaDescription: '',
  ogImageUrl: '',
  accentColor: '#6366f1',
  primaryColor: '#6366f1',
  secondaryColor: '#22d3ee',
  fontFamily: 'dm-sans',
  layoutMode: 'single-page',
  glassStyle: 'medium',
  portfolioTheme: 'glass',
  sectionVisibility: {},
  analyticsId: '',
  showStats: true,
  showAiStrip: true,
  showTestimonials: false,
  showBlog: false,
  cursorEffect: 'none',
  projectPreviewMode: 'webview',
  projectWebviewSlowScroll: false,
};

export default function AdminSettingsPage() {
  const { activeProfile } = useAdminProfile();
  const [form, setForm] = useState<SiteSettings>(defaults);
  const [saving, setSaving] = useState(false);
  const { isDirty, lastSavedAt, commitBaseline } = useUnsavedForm(form);

  useEffect(() => {
    if (!activeProfile) return;
    adminApi
      .getSettings(activeProfile._id)
      .then((data) => {
        const merged = {
          ...defaults,
          ...(data || {}),
          primaryColor: data?.primaryColor || data?.accentColor || defaults.primaryColor,
          portfolioTheme: data?.portfolioTheme || defaults.portfolioTheme,
          sectionVisibility: data?.sectionVisibility || {},
          cursorEffect:
            data?.cursorEffect ||
            (data?.showCursorGlow ? 'glow' : defaults.cursorEffect),
        };
        setForm(merged);
        commitBaseline(merged);
      })
      .catch((err) => toast.error(errorMessage(err, 'Failed to load settings')));
  }, [activeProfile, commitBaseline]);

  const save = async () => {
    if (!activeProfile) return;
    setSaving(true);
    try {
      const payload = { ...form, accentColor: form.primaryColor };
      await adminApi.updateSettings(activeProfile._id, payload);
      commitBaseline(payload);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (id: string, enabled: boolean) => {
    setForm((f) => ({
      ...f,
      sectionVisibility: { ...f.sectionVisibility, [id]: enabled },
    }));
  };

  return (
    <RequireActiveProfile>
      <div className="space-y-6 max-w-3xl">
        <UnsavedChangesBar
          isDirty={isDirty}
          saving={saving}
          lastSavedAt={lastSavedAt}
          onSave={save}
        />
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-primary">Personalization & Settings</h1>
            <p className="text-sm text-subtle mt-1">
              Theme and layout for <span className="text-accent">{activeProfile?.displayName}</span>
            </p>
          </div>
          <Button onClick={save} disabled={saving || !isDirty}>
            {saving ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
          </Button>
        </div>

        {/* Live preview */}
        <Card className="glass-panel overflow-hidden">
          <p className="text-xs font-mono text-subtle mb-3">Live Preview</p>
          <div className="grid md:grid-cols-2 gap-4 items-start">
            <ThemePreviewMini
              themeId={form.portfolioTheme || 'glass'}
              displayName={activeProfile?.displayName || 'Your Name'}
              settings={{
                primaryColor: form.primaryColor,
                secondaryColor: form.secondaryColor,
                fontFamily: form.fontFamily,
              }}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">
                {getPortfolioTheme(form.portfolioTheme).name}
              </p>
              <p className="text-xs text-subtle">
                {getPortfolioTheme(form.portfolioTheme).description}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="glass-pill px-3 py-1 rounded-full text-xs font-mono" style={{ color: form.primaryColor }}>Primary</span>
                <span className="glass-pill px-3 py-1 rounded-full text-xs font-mono" style={{ color: form.secondaryColor }}>Secondary</span>
                <Badge variant="accent">{form.layoutMode === 'multi-page' ? 'Multi-page' : 'Single-page'}</Badge>
                <Badge variant="outline">Glass: {form.glassStyle}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-primary">Portfolio Theme</h2>
            <p className="text-sm text-subtle mt-1">
              Current:{' '}
              <span className="text-primary font-medium">
                {getPortfolioTheme(form.portfolioTheme).name}
              </span>
              . Switch templates from the Add Theme page.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/dashboard/themes/new">
              <Palette className="h-4 w-4" /> Add Theme
            </Link>
          </Button>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-primary">Theme & Colors</h2>
          <p className="text-sm text-subtle">Fine-tune colors and typography within your selected theme.</p>

          <div className="space-y-3">
            <p className="text-sm font-medium text-secondary">Color palettes</p>
            <p className="text-xs text-subtle">
              Bright primary accents with soft secondary washes — built for Soft Bento and other themes.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COLOR_PALETTE_OPTIONS.map((palette) => {
                const selected = findMatchingColorPalette(form.primaryColor, form.secondaryColor)?.id === palette.id;
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        primaryColor: palette.primary,
                        secondaryColor: palette.secondary,
                        accentColor: palette.primary,
                      })
                    }
                    className={`glass-card p-0 overflow-hidden text-left transition-all ${
                      selected ? 'ring-2 ring-accent border-accent/40' : 'hover:border-white/20'
                    }`}
                  >
                    <div
                      className="relative h-[4.25rem] p-2"
                      style={{
                        background: `radial-gradient(ellipse 90% 80% at 0% 0%, ${palette.primary}40, transparent 55%), ${palette.secondary}`,
                      }}
                    >
                      <div
                        className="absolute inset-2 rounded-xl border border-black/5 shadow-sm flex items-end p-2"
                        style={{ background: `color-mix(in srgb, ${palette.secondary} 55%, white)` }}
                      >
                        <span
                          className="h-2.5 w-10 rounded-full shadow-sm"
                          style={{ background: palette.primary }}
                        />
                      </div>
                    </div>
                    <div className="px-3 pt-2.5 pb-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/10"
                          style={{ background: palette.primary }}
                          title="Primary"
                        />
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/10"
                          style={{ background: palette.secondary }}
                          title="Secondary"
                        />
                      </div>
                      <p className="text-sm font-semibold text-primary leading-tight">{palette.label}</p>
                      <p className="text-[11px] text-subtle mt-1 line-clamp-2 leading-snug">{palette.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormField label="Primary Color">
              <div className="flex gap-2 items-center">
                <Input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="h-10 w-16" />
                <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} />
              </div>
            </FormField>
            <FormField label="Secondary Color">
              <div className="flex gap-2 items-center">
                <Input type="color" value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} className="h-10 w-16" />
                <Input value={form.secondaryColor} onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })} />
              </div>
            </FormField>
            <FormField label="Font Family">
              <select
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm"
                value={form.fontFamily}
                onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Glassmorphism Intensity">
              <select
                className="w-full rounded-lg border border-border bg-elevated px-3 py-2 text-sm"
                value={form.glassStyle}
                onChange={(e) => setForm({ ...form, glassStyle: e.target.value as SiteSettings['glassStyle'] })}
              >
                <option value="subtle">Subtle</option>
                <option value="medium">Medium</option>
                <option value="strong">Strong</option>
              </select>
            </FormField>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-secondary">Cursor effect</p>
            <p className="text-xs text-subtle">
              Choose how the portfolio responds to mouse movement on desktop. None disables all effects.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {CURSOR_EFFECT_OPTIONS.map((option) => {
                const selected = (form.cursorEffect || 'none') === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex items-start gap-3 glass-card p-3 cursor-pointer transition-all ${
                      selected ? 'ring-2 ring-accent border-accent/40' : 'hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cursorEffect"
                      className="mt-1"
                      checked={selected}
                      onChange={() => setForm({ ...form, cursorEffect: option.id, showCursorGlow: option.id !== 'none' })}
                    />
                    <div>
                      <p className="text-sm font-medium text-primary">{option.label}</p>
                      <p className="text-xs text-subtle mt-1">{option.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-primary">Project Previews</h2>
          <p className="text-sm text-subtle">
            Choose how project cards show media across all themes. Webview embeds the live site frontpage when a Live URL exists.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {([
              { id: 'image' as const, label: 'Current view (image)', desc: 'Use the CMS project image when available' },
              { id: 'webview' as const, label: 'Webview', desc: 'Show a live frontpage preview from the project Live URL' },
            ]).map((opt) => {
              const selected = (form.projectPreviewMode || 'image') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm({ ...form, projectPreviewMode: opt.id })}
                  className={`glass-card p-4 text-left transition-all ${selected ? 'ring-2 ring-accent border-accent/40' : 'hover:border-white/20'}`}
                >
                  <p className="font-semibold text-primary">{opt.label}</p>
                  <p className="text-xs text-subtle mt-1">{opt.desc}</p>
                </button>
              );
            })}
          </div>
          <label
            className={`flex items-start gap-3 glass-card p-3 cursor-pointer transition-all ${
              form.projectWebviewSlowScroll ? 'ring-2 ring-accent border-accent/40' : 'hover:border-white/20'
            } ${form.projectPreviewMode !== 'webview' ? 'opacity-50' : ''}`}
          >
            <input
              type="checkbox"
              className="mt-1"
              checked={!!form.projectWebviewSlowScroll}
              disabled={form.projectPreviewMode !== 'webview'}
              onChange={(e) => setForm({ ...form, projectWebviewSlowScroll: e.target.checked })}
            />
            <div>
              <p className="text-sm font-medium text-primary">Slow scroll into webview</p>
              <p className="text-xs text-subtle mt-1">
                Gently pans the webview preview so more of the landing page comes into view.
              </p>
            </div>
          </label>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-primary">Layout Mode</h2>
          <p className="text-sm text-subtle">Choose how visitors navigate this portfolio.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {(['single-page', 'multi-page'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setForm({ ...form, layoutMode: mode })}
                className={`glass-card p-4 text-left transition-all ${form.layoutMode === mode ? 'ring-2 ring-accent border-accent/40' : 'hover:border-white/20'}`}
              >
                <p className="font-semibold text-primary capitalize">{mode.replace('-', ' ')}</p>
                <p className="text-xs text-subtle mt-1">
                  {mode === 'single-page'
                    ? 'All sections on one scrollable page with anchor navigation'
                    : 'Each section is a separate page with individual URLs'}
                </p>
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-primary">Navigation Sections</h2>
          <p className="text-sm text-subtle">Choose which sections appear in the menu for this profile.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {PORTFOLIO_NAV_SECTIONS.map((section) => {
              const enabled = form.sectionVisibility?.[section.id] !== false;
              return (
                <label
                  key={section.id}
                  className={`flex items-center gap-3 glass-card p-3 cursor-pointer ${enabled ? 'border-accent/30' : 'opacity-60'}`}
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => toggleSection(section.id, e.target.checked)}
                  />
                  <div>
                    <p className="text-sm font-medium">{section.label}</p>
                    <p className="text-xs text-subtle font-mono">
                      {form.layoutMode === 'multi-page' ? `/{slug}/${section.path}` : `#${section.id}`}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-primary">SEO & Extras</h2>
          <FormField label="Site Title"><Input value={form.siteTitle} onChange={(e) => setForm({ ...form, siteTitle: e.target.value })} /></FormField>
          <div>
            <AiFieldLabel label="Meta Description">
              {activeProfile && (
                <GenerateWithAiButton
                  profileId={activeProfile._id}
                  section="metaDescription"
                  context={{ siteTitle: form.siteTitle, metaDescription: form.metaDescription }}
                  onResult={(r) => setForm({ ...form, metaDescription: r as string })}
                />
              )}
            </AiFieldLabel>
            <Textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
          </div>
          <MediaPickerField
            label="OG Image"
            value={form.ogImageUrl}
            onChange={(url) => setForm({ ...form, ogImageUrl: url })}
            placeholder="Social share image URL"
          />
          <FormField label="Analytics ID"><Input value={form.analyticsId} onChange={(e) => setForm({ ...form, analyticsId: e.target.value })} placeholder="G-XXXXXXXX" /></FormField>
          <div className="space-y-2">
            <p className="text-sm font-medium text-secondary">Section Toggles</p>
            {[
              { key: 'showStats', label: 'Show Stats Bar' },
              { key: 'showAiStrip', label: 'Show AI Tools Strip' },
              { key: 'showTestimonials', label: 'Show Testimonials' },
              { key: 'showBlog', label: 'Show Blog' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form[key as keyof SiteSettings] as boolean}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>
        </Card>
      </div>
    </RequireActiveProfile>
  );
}
