import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Sun, Moon, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { PORTFOLIO_THEME_LIST } from '@/themes/registry';
import type { PortfolioThemeId } from '@/themes/types';
import type { SiteSettings } from '@/types';
import ThemePreviewMini from '@/components/admin/ThemePreviewMini';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';
import { PageLoader, InlineSpinner } from '@/components/ui/PageLoader';

const FEATURED_ID: PortfolioThemeId = 'olive';

function AddThemePageInner() {
  const { activeProfile } = useAdminProfile();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selected, setSelected] = useState<PortfolioThemeId | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeProfile) return;
    setLoading(true);
    adminApi
      .getSettings(activeProfile._id)
      .then((data) => {
        const s = data as SiteSettings;
        setSettings(s);
        setSelected((s.portfolioTheme as PortfolioThemeId) || FEATURED_ID);
      })
      .catch(() => toast.error('Failed to load themes'))
      .finally(() => setLoading(false));
  }, [activeProfile]);

  const selectedTheme = useMemo(
    () => PORTFOLIO_THEME_LIST.find((t) => t.id === selected) || null,
    [selected]
  );

  const previewSettings = {
    primaryColor: selectedTheme?.defaults.primaryColor || settings?.primaryColor || '#5F8A4A',
    secondaryColor: selectedTheme?.defaults.secondaryColor || settings?.secondaryColor || '#8E95A0',
    fontFamily: selectedTheme?.defaults.fontFamily || settings?.fontFamily || 'poppins',
  };

  const handleApply = async () => {
    if (!activeProfile) return;
    if (!selected) {
      setError('Select a portfolio theme to continue.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const themeDef = PORTFOLIO_THEME_LIST.find((t) => t.id === selected);
      // Apply theme look (colors + layout defaults) but keep the editor's chosen font
      // unless this portfolio has never set one.
      const next = {
        ...(settings || {}),
        ...themeDef?.defaults,
        portfolioTheme: selected,
        accentColor: themeDef?.defaults.primaryColor || settings?.primaryColor,
        primaryColor: themeDef?.defaults.primaryColor || settings?.primaryColor,
        secondaryColor: themeDef?.defaults.secondaryColor || settings?.secondaryColor,
        fontFamily: settings?.fontFamily || themeDef?.defaults.fontFamily || 'dm-sans',
      } as SiteSettings;
      const saved = (await adminApi.updateSettings(activeProfile._id, next)) as SiteSettings;
      setSettings(saved);
      toast.success(`${themeDef?.name || 'Theme'} applied to this portfolio`);
      navigate('/dashboard/settings');
    } catch {
      toast.error('Could not apply theme. Try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader variant="inline" label="Loading themes" className="min-h-[60vh]" />;
  }

  return (
    <div className="olive-add-theme -mx-4 -mt-2 md:-mx-6">
      <section className="bg-[#0d0d0d] px-4 pb-10 pt-8 text-white md:px-8">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[#8E95A0]">
              Portfolio Maker
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              Add New Portfolio Theme
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#c8c8c8]">
              Pick a production theme for this portfolio. Olive Career mirrors the attached Figma —
              moss-green accents, circular hero, skill tiles, outline experience cards, and a solid
              contact panel.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2a2a] text-[#a0a0a0] hover:text-white"
            aria-label="Toggle admin appearance"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        {/* Figma-style featured strip */}
        <div className="mx-auto mt-8 grid max-w-5xl items-center gap-8 rounded-[1.5rem] border border-[#2a2a2a] bg-black px-5 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-8">
          <div>
            <p className="text-base text-white">Hello! My name is</p>
            <p className="mt-1 text-4xl font-extrabold leading-none text-[#5F8A4A] md:text-5xl">
              {activeProfile?.displayName || 'Your Name'}
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/90">
              Dark charcoal layout with pipe section headers, green CTAs, and credential badges —
              built for every CMS section you already have.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#5F8A4A] px-4 py-2.5 text-sm font-semibold text-white">
              About me <UserRound className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="aspect-square w-44 rounded-full bg-[#2a2a2a] p-3 md:w-52">
              <div className="grid h-full w-full place-items-center rounded-full bg-[#1a1a1a] text-3xl font-extrabold text-[#5F8A4A]">
                {(activeProfile?.displayName || 'YC')
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((p) => p[0]?.toUpperCase())
                  .join('')}
              </div>
            </div>
          </div>
        </div>

        {PORTFOLIO_THEME_LIST.length === 0 ? (
          <div className="mx-auto mt-10 max-w-5xl rounded-2xl border border-dashed border-[#3a3a3a] p-10 text-center text-sm text-[#8E95A0]">
            No themes registered yet.
          </div>
        ) : (
          <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PORTFOLIO_THEME_LIST.map((themeOption) => {
              const isSelected = selected === themeOption.id;
              const isFeatured = themeOption.id === FEATURED_ID;
              return (
                <button
                  key={themeOption.id}
                  type="button"
                  onClick={() => {
                    setSelected(themeOption.id);
                    setError('');
                  }}
                  className={cn(
                    'rounded-2xl border p-3 text-left transition-all',
                    isSelected
                      ? 'border-[#5F8A4A] bg-[#121212] shadow-[0_0_28px_rgba(95,138,74,0.28)]'
                      : 'border-[#2a2a2a] bg-black hover:border-[#4a4a4a]'
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <ThemePreviewMini
                      themeId={themeOption.id}
                      displayName={activeProfile?.displayName || 'You'}
                      settings={
                        isSelected
                          ? previewSettings
                          : {
                              primaryColor: themeOption.defaults.primaryColor || '#6366f1',
                              secondaryColor: themeOption.defaults.secondaryColor || '#22d3ee',
                              fontFamily: themeOption.defaults.fontFamily || 'dm-sans',
                            }
                      }
                    />
                    {isSelected && (
                      <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5F8A4A] text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="mt-3 px-1">
                    <p className="text-sm font-semibold text-white">
                      {themeOption.name}
                      {isFeatured && (
                        <span className="ml-2 rounded-full bg-[#5F8A4A]/20 px-2 py-0.5 text-[0.65rem] font-semibold text-[#9BC484]">
                          New
                        </span>
                      )}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[0.7rem] leading-relaxed text-[#8E95A0]">
                      {themeOption.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <p className="mx-auto mt-4 max-w-5xl text-xs text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={handleApply}
            className="inline-flex items-center gap-2 rounded-lg bg-[#5F8A4A] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(95,138,74,0.45)] transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? (
              <>
                <InlineSpinner className="border-white/40 border-t-white" /> Applying…
              </>
            ) : (
              <>
                Apply theme <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/settings')}
            className="rounded-lg border border-[#3a3a3a] px-4 py-2.5 text-sm text-[#c8c8c8] hover:border-[#5a5a5a]"
          >
            Cancel
          </button>
        </div>
      </section>

      <section className="bg-[#000] px-4 py-12 text-white md:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="flex items-baseline gap-2 text-xl font-bold md:text-2xl">
            <span className="inline-block h-[1.05em] w-[3px] translate-y-[0.12em] rounded-sm bg-[#5F8A4A]" aria-hidden />
            {(selectedTheme?.name || 'Theme')} includes:
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Hero + About', copy: 'Green name, circular halo photo, pipe header, and big stat callout.' },
              { title: 'Skills', copy: 'First tile accent green; remaining tiles slate gray with icons.' },
              { title: 'Projects + Experience', copy: 'Dark project cards and green-outline role cards.' },
              { title: 'Contact + Certifications', copy: 'Solid green contact panel and certification badges with optional screenshots.' },
            ].map((card) => (
              <article
                key={card.title}
                className="rounded-2xl border border-[#5F8A4A] bg-transparent p-4"
              >
                <h3 className="text-xs font-extrabold uppercase tracking-wide">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#c8c8c8]">{card.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AdminAddThemePage() {
  return (
    <RequireActiveProfile>
      <AddThemePageInner />
    </RequireActiveProfile>
  );
}
