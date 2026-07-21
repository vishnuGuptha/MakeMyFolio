import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { writeGuestPreviewSnapshot, type GuestDraft } from '@/context/GuestDraftContext';
import { PageLoader } from '@/components/ui/PageLoader';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

/** Logical viewports so theme media queries behave like real devices. */
export const DESKTOP_VW = 1080;
export const DESKTOP_VH = 680;
/** iPad Air-ish portrait */
export const TABLET_VW = 820;
export const TABLET_VH = 1180;
export const MOBILE_VW = 390;
export const MOBILE_VH = 780;

/** Phone chrome — thin bezel; home indicator is overlaid on the screen. */
const MOBILE_BORDER = 3;
const MOBILE_PAD = 3;

/** iPad chrome — thicker bezel + camera strip. */
const TABLET_BORDER = 10;
const TABLET_PAD = 8;
const TABLET_CAMERA = 12;

/** Desktop Mac chrome — pad + camera strip + hinge/base below the screen. */
const DESKTOP_PAD = 10;
const DESKTOP_CAMERA = 14;
/** h-2 hinge + h-2.5 base */
const DESKTOP_BASE_H = 18;
/** Base uses w-[112%] — fit against the wider footprint */
const DESKTOP_BASE_WIDTH_FACTOR = 1.12;

const DEFAULT_SRC = '/try/preview?embed=1';

const DEVICE_VIEWPORT: Record<DeviceMode, { vw: number; vh: number }> = {
  desktop: { vw: DESKTOP_VW, vh: DESKTOP_VH },
  tablet: { vw: TABLET_VW, vh: TABLET_VH },
  mobile: { vw: MOBILE_VW, vh: MOBILE_VH },
};

function chromeFor(device: DeviceMode) {
  if (device === 'mobile') {
    return {
      chromeW: MOBILE_BORDER * 2 + MOBILE_PAD * 2,
      chromeH: MOBILE_BORDER * 2 + MOBILE_PAD * 2,
      widthFactor: 1,
      maxScale: 0.85,
    };
  }
  if (device === 'tablet') {
    return {
      chromeW: TABLET_BORDER * 2 + TABLET_PAD * 2,
      chromeH: TABLET_BORDER * 2 + TABLET_PAD * 2 + TABLET_CAMERA,
      widthFactor: 1,
      maxScale: 0.8,
    };
  }
  return {
    chromeW: DESKTOP_PAD * 2,
    chromeH: DESKTOP_PAD * 2 + DESKTOP_CAMERA + DESKTOP_BASE_H,
    widthFactor: DESKTOP_BASE_WIDTH_FACTOR,
    maxScale: 0.9,
  };
}

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
  const [frameReady, setFrameReady] = useState(false);

  const { vw, vh } = DEVICE_VIEWPORT[device];
  const { chromeW, chromeH, widthFactor, maxScale } = chromeFor(device);

  useEffect(() => {
    setFrameReady(false);
  }, [device, src]);

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
      const { width, height } = stage.getBoundingClientRect();
      const margin = 8;
      const availW = Math.max(80, width - margin);
      const availH = Math.max(80, height - margin);
      const widthBudget = availW / widthFactor - chromeW;
      const fitted = Math.min(widthBudget / vw, (availH - chromeH) / vh);
      setScale(Math.min(Math.max(fitted, 0.12), maxScale));
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    window.addEventListener('resize', fit);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, [device, vw, vh, chromeW, chromeH, widthFactor, maxScale]);

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
    opacity: frameReady ? 1 : 0,
    transition: 'opacity 0.35s ease',
  };

  const onFrameLoad = () => setFrameReady(true);

  return (
    <div
      className={cn('flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden', className)}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        ref={stageRef}
        className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden overscroll-none"
      >
        {!frameReady && (
          <PageLoader
            variant="overlay"
            label="Preparing preview"
            className="rounded-[inherit] bg-transparent backdrop-blur-0"
            delayMs={80}
          />
        )}
        {device === 'mobile' && (
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
                  onLoad={onFrameLoad}
                />
                <div
                  className="pointer-events-none absolute bottom-1.5 left-1/2 z-10 h-1 w-[28%] max-w-[100px] -translate-x-1/2 rounded-full bg-zinc-900/35"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        )}

        {device === 'tablet' && (
          <div className="shrink-0" style={{ width: shellW }}>
            <div
              className="relative box-border rounded-[1.35rem] border-solid border-zinc-700 bg-zinc-900 shadow-[0_36px_72px_-16px_rgba(0,0,0,0.55),0_0_56px_-16px_rgba(0,102,255,0.35)]"
              style={{
                borderWidth: TABLET_BORDER,
                padding: TABLET_PAD,
              }}
            >
              <div
                className="relative isolate overflow-hidden rounded-[0.85rem] bg-black"
                style={{
                  width: displayW,
                  height: displayH + TABLET_CAMERA,
                  WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                  maskImage: 'radial-gradient(white, black)',
                }}
              >
                <div className="absolute left-1/2 top-1.5 z-10 -translate-x-1/2">
                  <span className="block h-1.5 w-1.5 rounded-full bg-zinc-600 ring-1 ring-zinc-500/80" />
                </div>
                <div
                  className="absolute left-0 overflow-hidden bg-black"
                  style={{ top: TABLET_CAMERA, width: displayW, height: displayH }}
                >
                  <iframe
                    key={`tablet-${src}`}
                    ref={iframeRef}
                    title="iPad theme preview"
                    src={src}
                    className="absolute left-0 top-0 block border-0"
                    style={iframeStyle}
                    onLoad={onFrameLoad}
                  />
                </div>
                <div
                  className="pointer-events-none absolute bottom-2 left-1/2 z-10 h-1 w-[18%] max-w-[120px] -translate-x-1/2 rounded-full bg-zinc-900/30"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        )}

        {device === 'desktop' && (
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
                    onLoad={onFrameLoad}
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
