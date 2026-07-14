import { useEffect } from 'react';
import { ensureGoogleFontLoaded, FONT_OPTIONS } from '@/lib/theme';
import type { SiteSettings } from '@/types';
import type { PortfolioThemeId } from '@/themes/types';

export default function ThemePreviewMini({
  themeId,
  displayName,
  settings,
}: {
  themeId: PortfolioThemeId;
  displayName: string;
  settings: Pick<SiteSettings, 'primaryColor' | 'secondaryColor' | 'fontFamily'>;
}) {
  const fontOption = FONT_OPTIONS.find((f) => f.id === settings.fontFamily) || FONT_OPTIONS[0];
  const font = fontOption.family;

  useEffect(() => {
    ensureGoogleFontLoaded(fontOption.google);
  }, [fontOption.google]);

  if (themeId === 'terminal') {
    return (
      <div
        className="rounded-lg overflow-hidden border font-mono text-[10px]"
        style={{ fontFamily: font || 'monospace', background: '#0d1117', borderColor: `${settings.primaryColor}66` }}
      >
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b" style={{ borderColor: `${settings.primaryColor}33`, background: '#161b22' }}>
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-gray-500 ml-1">bash — portfolio</span>
        </div>
        <div className="p-3 grid grid-cols-[1fr_auto] gap-2 items-start">
          <div className="space-y-1 min-w-0">
            <p style={{ color: settings.primaryColor }}>$ whoami</p>
            <p className="text-gray-200 pl-2 truncate">{displayName.split(' ')[0]}</p>
            <p style={{ color: settings.primaryColor }} className="pt-1">$ skills --rotate</p>
            <p style={{ color: settings.secondaryColor }} className="pl-2">React.js_</p>
          </div>
          <div
            className="h-12 w-12 rounded shrink-0 border flex items-center justify-center text-[9px] font-bold text-gray-400"
            style={{ borderColor: `${settings.primaryColor}66`, background: '#0d1117' }}
          >
            IMG
          </div>
        </div>
      </div>
    );
  }

  if (themeId === 'command-center') {
    return (
      <div
        className="rounded-xl overflow-hidden border border-white/10"
        style={{ fontFamily: font, background: '#0B1120' }}
      >
        <div className="mx-3 mt-2 h-6 rounded-full flex items-center px-3 gap-2" style={{ background: '#172033', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-[8px] font-bold" style={{ color: settings.primaryColor }}>
            {displayName.split(' ')[0]?.toUpperCase()}
          </span>
          <span className="text-[8px]" style={{ color: settings.secondaryColor }}>DEV</span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg p-2" style={{ background: '#172033', border: '1px solid rgba(59,130,246,0.2)' }}>
            <p className="text-[7px] font-mono mb-1" style={{ color: settings.secondaryColor }}>&gt; init...</p>
            <p className="text-[9px] font-bold text-white">Hi, I&apos;m {displayName.split(' ')[0]}</p>
            <div className="mt-1.5 h-3 w-12 rounded" style={{ background: `linear-gradient(90deg, ${settings.primaryColor}, ${settings.secondaryColor})` }} />
          </div>
          <div className="rounded-lg p-2 space-y-1" style={{ background: '#172033', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-[7px] text-green-300">Available</span>
            </div>
            <div className="h-1 rounded-full bg-white/10">
              <div className="h-full w-2/3 rounded-full" style={{ background: settings.primaryColor }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (themeId === 'bento') {
    const primary = settings.primaryColor || '#14B8A6';
    const secondary = settings.secondaryColor || '#CCFBF1';
    return (
      <div
        className="rounded-xl overflow-hidden p-2"
        style={{
          fontFamily: font,
          background: `radial-gradient(ellipse 90% 70% at 0% 0%, ${primary}33, transparent 55%), ${secondary}`,
        }}
      >
        <div className="flex justify-between items-center px-1 mb-2">
          <span className="text-[8px] font-bold uppercase tracking-wider text-neutral-800">
            {displayName.split(' ')[0]}
          </span>
          <span className="text-[7px] uppercase tracking-widest text-neutral-500">About · Projects</span>
        </div>
        <div className="grid grid-cols-[1.2fr_1.1fr_0.7fr] gap-1.5">
          <div
            className="rounded-xl p-2"
            style={{ background: `color-mix(in srgb, ${secondary} 50%, white)` }}
          >
            <p className="text-[9px] font-bold leading-tight text-neutral-900">Building thoughtful products.</p>
          </div>
          <div
            className="row-span-2 rounded-xl p-1.5 flex flex-col gap-1"
            style={{ background: `color-mix(in srgb, ${secondary} 45%, white)` }}
          >
            <div className="h-5 rounded-md" style={{ background: `${primary}22` }} />
            <p className="text-[6px] text-neutral-600 leading-tight">Projects</p>
            <div className="h-1 rounded-full w-3/4" style={{ background: primary }} />
            <div className="h-1 rounded-full bg-neutral-300/50 w-1/2" />
          </div>
          <div className="row-span-2 rounded-xl" style={{ background: primary, minHeight: 52, opacity: 0.85 }} />
          <div
            className="rounded-xl p-2 text-[7px] text-neutral-600"
            style={{ background: `color-mix(in srgb, ${secondary} 35%, white)` }}
          >
            Bio snippet…
          </div>
        </div>
      </div>
    );
  }

  if (themeId === 'studio') {
    const accent = settings.primaryColor || '#68AD0F';
    return (
      <div className="h-full min-h-[7rem] rounded-xl overflow-hidden bg-black p-3 flex flex-col justify-center" style={{ fontFamily: font }}>
        <div className="mx-auto mb-2 flex h-5 w-full max-w-[90%] items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 px-2">
          <span className="truncate font-mono text-[7px] text-zinc-400">Home · Case Studies · Contact</span>
        </div>
        <div className="grid grid-cols-[1fr_auto] items-center gap-2">
          <div>
            <p className="text-[11px] font-bold text-white">{displayName.split(' ')[0]}</p>
            <p className="mt-1 font-mono text-[7px] leading-snug text-zinc-400">Let&apos;s get started</p>
            <div className="mt-2 h-4 w-16 rounded" style={{ background: accent, boxShadow: `0 4px 14px ${accent}66` }} />
          </div>
          <div className="h-12 w-12 rounded-full" style={{ background: settings.secondaryColor || '#2F4F4F' }} />
        </div>
      </div>
    );
  }

  if (themeId === 'olive') {
    const accent = settings.primaryColor || '#5F8A4A';
    const slate = settings.secondaryColor || '#8E95A0';
    return (
      <div
        className="h-full min-h-[7rem] rounded-xl overflow-hidden bg-[#0d0d0d] p-3 flex flex-col justify-center"
        style={{ fontFamily: font }}
      >
        <div className="grid grid-cols-[1.2fr_auto] items-center gap-2">
          <div>
            <p className="text-[7px] text-white/80">Hello! My name is</p>
            <p className="text-[12px] font-extrabold leading-tight" style={{ color: accent }}>
              {displayName.split(' ')[0] || 'You'}
            </p>
            <div className="mt-2 h-4 w-14 rounded-md" style={{ background: accent }} />
          </div>
          <div className="h-12 w-12 rounded-full bg-[#2a2a2a] p-1">
            <div className="h-full w-full rounded-full" style={{ background: slate }} />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1">
          <div className="h-5 rounded" style={{ background: accent }} />
          <div className="h-5 rounded" style={{ background: slate }} />
          <div className="h-5 rounded" style={{ background: slate }} />
          <div className="h-5 rounded" style={{ background: slate }} />
        </div>
      </div>
    );
  }

  if (themeId === 'spotlight') {
    return (
      <div
        className="rounded-xl overflow-hidden border border-white/10"
        style={{ fontFamily: font, background: '#0a0a0a' }}
      >
        <div className="h-8 border-b border-white/10 flex items-center px-3 gap-2">
          <div className="h-4 w-4 rounded-full" style={{ background: settings.primaryColor }} />
          <span className="text-[10px] text-white/80">
            {displayName.split(' ')[0]}<span style={{ color: settings.primaryColor }}>.dev</span>
          </span>
        </div>
        <div className="p-4 grid grid-cols-[1fr_auto] gap-3 items-center">
          <div>
            <p className="text-[10px] text-white/50 mb-1">Hello.</p>
            <p
              className="text-sm font-bold leading-tight"
              style={{
                background: `linear-gradient(90deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Software Engineer
            </p>
            <div
              className="mt-2 inline-block px-2 py-0.5 rounded-full text-[8px] font-semibold text-black"
              style={{ background: settings.primaryColor }}
            >
              Hire Me
            </div>
          </div>
          <div
            className="h-12 w-12 rounded-full shrink-0"
            style={{
              boxShadow: `0 0 12px ${settings.primaryColor}55`,
              border: `2px solid ${settings.primaryColor}`,
              background: '#1a1a1a',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/10 p-4"
      style={{
        fontFamily: font,
        background: `radial-gradient(ellipse at top, ${settings.primaryColor}33, transparent 60%), #0f172a`,
      }}
    >
      <p className="text-[10px] font-mono mb-1" style={{ color: settings.primaryColor }}>
        Hi, my name is
      </p>
      <p
        className="text-sm font-bold mb-1"
        style={{
          background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {displayName || 'Your Name'}
      </p>
      <div className="flex gap-1 mt-2">
        <span className="h-4 w-10 rounded-full text-[7px] flex items-center justify-center text-white/80 bg-white/10">
          Glass
        </span>
        <span
          className="h-4 w-10 rounded-full text-[7px] flex items-center justify-center text-black font-medium"
          style={{ background: settings.primaryColor }}
        >
          CTA
        </span>
      </div>
    </div>
  );
}
