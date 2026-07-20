import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { writeGuestPreviewSnapshot, type GuestDraft } from '@/context/GuestDraftContext';

export type DeviceMode = 'desktop' | 'mobile';

/** Logical viewport so theme media queries match desktop (keep ≥900px). */
export const DESKTOP_VW = 1080;
export const DESKTOP_VH = 680;
export const MOBILE_VW = 390;
export const MOBILE_VH = 780;

/** Phone chrome — thin bezel; home indicator is overlaid on the screen. */
const MOBILE_BORDER = 3;
const MOBILE_PAD = 3;
const MOBILE_HOME = 0;

/** Desktop Mac chrome — pad + camera strip + hinge/base below the screen. */
const DESKTOP_PAD = 10;
const DESKTOP_CAMERA = 14;
/** h-2 hinge + h-2.5 base */
const DESKTOP_BASE_H = 18;
/** Base uses w-[112%] — fit against the wider footprint */
const DESKTOP_BASE_WIDTH_FACTOR = 1.12;

const DEFAULT_SRC = '/try/preview?embed=1';

export function DeviceThemePreview({
  draft,
  device,
  className,
  /** Override iframe URL (marketing uses `/theme-demo/:id`) */
  src = DEFAULT_SRC,
  /** When true, skip writing guest draft snapshot (static embed URLs) */
  skipDraftSync = false,
}: {
  draft?: GuestDraft;
  device: DeviceMode;
  className?: string;
  src?: string;
  skipDraftSync?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  const isMobile = device === 'mobile';
  const vw = isMobile ? MOBILE_VW : DESKTOP_VW;
  const vh = isMobile ? MOBILE_VH : DESKTOP_VH;

  const chromeW = isMobile ? MOBILE_BORDER * 2 + MOBILE_PAD * 2 : DESKTOP_PAD * 2;
  const chromeH = isMobile
    ? MOBILE_BORDER * 2 + MOBILE_PAD * 2 + MOBILE_HOME
    : DESKTOP_PAD * 2 + DESKTOP_CAMERA + DESKTOP_BASE_H;

  useEffect(() => {
    if (skipDraftSync || !draft) return;
    writeGuestPreviewSnapshot(draft);
  }, [draft, skipDraftSync]);

  useEffect(() => {
    if (skipDraftSync || !draft) return;
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      { type: 'buildmyfolio-guest-refresh' },
      window.location.origin
    );
  }, [draft?.updatedAt, draft?.themeId, device, skipDraftSync, draft]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const fit = () => {
      // Measure the viewport box (parent constrains height) — not content size.
      const { width, height } = stage.getBoundingClientRect();
      const margin = 8;
      const availW = Math.max(80, width - margin);
      const availH = Math.max(80, height - margin);

      let fitted: number;
      if (isMobile) {
        fitted = Math.min((availW - chromeW) / vw, (availH - chromeH) / vh);
      } else {
        // Base is wider than the lid; reserve width for the overhang.
        const widthBudget = availW / DESKTOP_BASE_WIDTH_FACTOR - chromeW;
        fitted = Math.min(widthBudget / vw, (availH - chromeH) / vh);
      }

      // Never force a floor that can overflow the stage.
      setScale(Math.min(Math.max(fitted, 0.12), isMobile ? 0.85 : 0.9));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [device, vw, vh, chromeW, chromeH, isMobile]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onWheel = (e: WheelEvent) => e.stopPropagation();
    stage.addEventListener('wheel', onWheel, { passive: true });
    return () => stage.removeEventListener('wheel', onWheel);
  }, [device]);

  const displayW = vw * scale;
  const displayH = vh * scale;
  const shellW = displayW + chromeW;

  const iframeStyle: CSSProperties = {
    width: vw,
    height: vh,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    backgroundColor: '#000',
  };

  return (
    <div
      className={cn('flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden', className)}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Dedicated measure box — fills the stage so scale fits the real viewport */}
      <div
        ref={stageRef}
        className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden overscroll-none"
      >
        {isMobile ? (
          <div className="shrink-0" style={{ width: shellW }}>
            <div
              className="relative box-border rounded-[1.65rem] border-solid border-zinc-800 bg-zinc-950 shadow-[0_32px_64px_-14px_rgba(0,0,0,0.55),0_0_48px_-14px_rgba(0,102,255,0.4)]"
              style={{
                borderWidth: MOBILE_BORDER,
                padding: MOBILE_PAD,
              }}
            >
              <div
                className="relative isolate overflow-hidden rounded-[1.35rem] bg-black"
                style={{
                  width: displayW,
                  height: displayH,
                  WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                  maskImage: 'radial-gradient(white, black)',
                }}
              >
                <iframe
                  key={`mobile-${src}`}
                  ref={iframeRef}
                  title="Mobile theme preview"
                  src={src}
                  className="absolute left-0 top-0 block border-0"
                  style={iframeStyle}
                />
                <div
                  className="pointer-events-none absolute bottom-1.5 left-1/2 z-10 h-1 w-[28%] max-w-[100px] -translate-x-1/2 rounded-full bg-zinc-900/35"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="shrink-0" style={{ width: shellW }}>
            <div
              className="overflow-hidden rounded-t-[12px] border border-white/40 bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-300 shadow-[0_40px_80px_-28px_rgba(15,23,42,0.55),0_0_70px_-24px_rgba(0,102,255,0.35)] ring-1 ring-black/5 dark:border-white/10 dark:from-zinc-600 dark:via-zinc-700 dark:to-zinc-800"
              style={{ padding: DESKTOP_PAD }}
            >
              <div
                className="relative isolate overflow-hidden rounded-[4px] bg-black ring-1 ring-black/60"
                style={{
                  width: displayW,
                  height: displayH + DESKTOP_CAMERA,
                  WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                  maskImage: 'radial-gradient(white, black)',
                }}
              >
                <div className="absolute left-1/2 top-1.5 z-10 -translate-x-1/2">
                  <span className="block h-1.5 w-1.5 rounded-full bg-zinc-800 ring-1 ring-zinc-600" />
                </div>
                <div
                  className="absolute left-0 overflow-hidden bg-black"
                  style={{ top: DESKTOP_CAMERA, width: displayW, height: displayH }}
                >
                  <iframe
                    key={`desktop-${src}`}
                    ref={iframeRef}
                    title="Desktop theme preview"
                    src={src}
                    className="absolute left-0 top-0 block border-0"
                    style={iframeStyle}
                  />
                </div>
              </div>
            </div>
            <div className="relative z-10 mx-auto h-2 w-[102%] -translate-x-[1%] bg-gradient-to-b from-zinc-500 to-zinc-700">
              <div className="absolute inset-x-[28%] top-0 h-full rounded-b-sm bg-zinc-600/90" />
            </div>
            <div className="relative mx-auto h-2.5 w-[112%] -translate-x-[6%] rounded-b-xl bg-gradient-to-b from-zinc-600 via-zinc-700 to-zinc-800 shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
