import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { writeGuestPreviewSnapshot, type GuestDraft } from '@/context/GuestDraftContext';

type DeviceMode = 'desktop' | 'mobile';

/** Logical viewport so theme media queries match desktop (keep ≥900px). */
const DESKTOP_VW = 1080;
const DESKTOP_VH = 680;
const MOBILE_VW = 390;
const MOBILE_VH = 780;

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
  /** Extra space for phone bezel / home bar / Mac lid chrome */
  const chromeW = isMobile ? 24 : 24;
  const chromeH = isMobile ? 56 : 40;

  useEffect(() => {
    writeGuestPreviewSnapshot(draft);
  }, [draft]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage(
      { type: 'makemyfolio-guest-refresh' },
      window.location.origin
    );
  }, [draft.updatedAt, draft.themeId, device]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const fit = () => {
      const { width, height } = stage.getBoundingClientRect();
      const pad = 8;
      const availW = Math.max(120, width - pad - chromeW);
      const availH = Math.max(120, height - pad - chromeH);
      const fitted = Math.min(availW / vw, availH / vh);
      setScale(Math.max(0.28, Math.min(fitted, isMobile ? 0.72 : 0.9)));
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

  const displayW = Math.round(vw * scale);
  const displayH = Math.round(vh * scale);

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
        <div className="shrink-0" style={{ width: displayW + 20 }}>
          {/* Phone shell */}
          <div className="relative rounded-[2rem] border-[5px] border-zinc-800 bg-zinc-950 p-[10px] shadow-xl shadow-black/40">
            {/* Screen — black fill avoids white corner bleed with scaled iframes */}
            <div
              className="relative isolate overflow-hidden rounded-[1.45rem] bg-black"
              style={{
                width: displayW,
                height: displayH,
                // Forces border-radius clip of transformed iframe layers
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
            </div>

            {/* Home indicator */}
            <div className="mx-auto mt-2.5 h-1 w-[30%] max-w-[108px] rounded-full bg-zinc-700" />
          </div>
        </div>
      ) : (
        <div className="shrink-0" style={{ width: displayW + 16 }}>
          <div className="overflow-hidden rounded-t-[12px] border border-zinc-500/70 bg-gradient-to-b from-zinc-400 via-zinc-500 to-zinc-600 p-2 shadow-xl shadow-black/35 sm:p-2.5">
            <div
              className="relative isolate overflow-hidden rounded-[4px] bg-black ring-1 ring-black/60"
              style={{
                width: displayW,
                height: displayH + 14,
                WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                maskImage: 'radial-gradient(white, black)',
              }}
            >
              <div className="absolute left-1/2 top-1.5 z-10 -translate-x-1/2">
                <span className="block h-1.5 w-1.5 rounded-full bg-zinc-800 ring-1 ring-zinc-600" />
              </div>
              <div
                className="absolute left-0 top-3.5 overflow-hidden bg-black"
                style={{ width: displayW, height: displayH }}
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
