import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { writeGuestPreviewSnapshot, type GuestDraft } from '@/context/GuestDraftContext';

type DeviceMode = 'desktop' | 'mobile';

/** Logical viewport so theme media queries match desktop (keep ≥900px). */
const DESKTOP_VW = 1080;
const DESKTOP_VH = 680;
const MOBILE_VW = 390;
const MOBILE_VH = 780;

/** Phone chrome — thin bezel; home indicator is overlaid on the screen. */
const MOBILE_BORDER = 3;
const MOBILE_PAD = 3;
const MOBILE_HOME = 0;

/** Desktop Mac chrome — p-2 / sm:p-2.5 + camera strip. */
const DESKTOP_PAD = 10;
const DESKTOP_CAMERA = 14;

export function DeviceThemePreview({
  draft,
  device,
  className,
}: {
  draft: GuestDraft;
  device: DeviceMode;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  const isMobile = device === 'mobile';
  const vw = isMobile ? MOBILE_VW : DESKTOP_VW;
  const vh = isMobile ? MOBILE_VH : DESKTOP_VH;

  const chromeW = isMobile
    ? MOBILE_BORDER * 2 + MOBILE_PAD * 2
    : DESKTOP_PAD * 2;
  const chromeH = isMobile
    ? MOBILE_BORDER * 2 + MOBILE_PAD * 2 + MOBILE_HOME
    : DESKTOP_PAD * 2 + DESKTOP_CAMERA;

  useEffect(() => {
    writeGuestPreviewSnapshot(draft);
  }, [draft]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      { type: 'buildmyfolio-guest-refresh' },
      window.location.origin
    );
  }, [draft.updatedAt, draft.themeId, device]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const fit = () => {
      const { width, height } = stage.getBoundingClientRect();
      const pad = 16;
      const availW = Math.max(120, width - pad - chromeW);
      const availH = Math.max(120, height - pad - chromeH);
      const fitted = Math.min(availW / vw, availH / vh);
      setScale(Math.max(0.28, Math.min(fitted, isMobile ? 0.85 : 0.9)));
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

  // Keep screen aperture and scaled iframe in exact sync (no Math.round drift).
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
      ref={stageRef}
      className={cn(
        'flex min-h-0 flex-1 items-center justify-center overflow-hidden overscroll-none',
        className
      )}
      onWheel={(e) => e.stopPropagation()}
    >
      {isMobile ? (
        <div className="shrink-0" style={{ width: shellW }}>
          {/* Phone shell — width fully accounted for by chromeW */}
          <div
            className="relative box-border rounded-[1.65rem] border-solid border-zinc-800 bg-zinc-950 shadow-xl shadow-black/40"
            style={{
              borderWidth: MOBILE_BORDER,
              padding: MOBILE_PAD,
            }}
          >
            {/* Screen aperture — exact scaled iframe size */}
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
                key="mobile"
                ref={iframeRef}
                title="Mobile theme preview"
                src="/try/preview?embed=1"
                className="absolute left-0 top-0 block border-0"
                style={iframeStyle}
              />
              {/* Home indicator overlaid on screen (no extra black chrome below) */}
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
            className="overflow-hidden rounded-t-[12px] border border-zinc-500/70 bg-gradient-to-b from-zinc-400 via-zinc-500 to-zinc-600 shadow-xl shadow-black/35"
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
                  key="desktop"
                  ref={iframeRef}
                  title="Desktop theme preview"
                  src="/try/preview?embed=1"
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
  );
}
