import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { usePortfolioData } from '@/context/PortfolioContext';
import type { ProjectPreviewMode } from '@/types';

/** Desktop capture — slightly wider crop so cover fill doesn't feel padded. */
const VIEWPORT_W = 1440;
const VIEWPORT_H = 810;

/** Viewport-cropped screenshots only (full-page shots crop left/right with object-fit:cover). */
function buildScreenshotCandidates(liveUrl: string): string[] {
  const normalized = liveUrl.replace(/\/$/, '') || liveUrl;
  const encoded = encodeURIComponent(normalized);
  const encodedSlash = encodeURIComponent(`${normalized}/`);
  return [
    // 11ty screenshot CDN — reliable viewport captures
    `https://v1.screenshot.11ty.dev/${encoded}/large/`,
    `https://v1.screenshot.11ty.dev/${encodedSlash}/large/`,
    // thum.io viewport crop (1280×800)
    `https://image.thum.io/get/width/${VIEWPORT_W}/crop/${VIEWPORT_H}/noanimate/${normalized}`,
    `https://image.thum.io/get/width/${VIEWPORT_W}/crop/${VIEWPORT_H}/noanimate/${normalized}/`,
    // WordPress mShots (sometimes blank on first hit — we retry)
    `https://s0.wp.com/mshots/v1/${encoded}?w=${VIEWPORT_W}&h=${VIEWPORT_H}`,
    `https://api.microlink.io/?url=${encoded}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=${VIEWPORT_W}&viewport.height=${VIEWPORT_H}`,
  ];
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function isUsableShot(img: HTMLImageElement) {
  // Reject tiny placeholders / 1×1 errors some CDNs return
  return img.naturalWidth >= 200 && img.naturalHeight >= 120;
}

export type ProjectMediaPreviewProps = {
  title: string;
  imageUrl?: string;
  liveUrl?: string;
  className?: string;
  mode?: ProjectPreviewMode;
  slowScroll?: boolean;
};

function resolveMode(
  modeProp: ProjectPreviewMode | undefined,
  settings?: { projectPreviewMode?: ProjectPreviewMode; portfolioTheme?: string } | null
): ProjectPreviewMode {
  if (modeProp === 'image' || modeProp === 'webview') return modeProp;
  if (settings?.projectPreviewMode === 'image' || settings?.projectPreviewMode === 'webview') {
    return settings.projectPreviewMode;
  }
  if (settings?.portfolioTheme === 'bento' || settings?.portfolioTheme === 'studio') return 'webview';
  return 'image';
}

/**
 * Shared project media — screenshot (fitted) + scaled iframe for live embeds.
 */
export default function ProjectMediaPreview({
  title,
  imageUrl,
  liveUrl,
  className,
  mode: modeProp,
  slowScroll: slowProp,
}: ProjectMediaPreviewProps) {
  const { settings } = usePortfolioData();
  const mode = resolveMode(modeProp, settings);
  const slowScroll = slowProp ?? settings?.projectWebviewSlowScroll ?? false;

  const hasImage = Boolean(imageUrl?.trim());
  const hasLive = Boolean(liveUrl?.trim());
  const useWebview = hasLive && (mode === 'webview' || (mode === 'image' && !hasImage));
  const useImage = hasImage && (mode === 'image' || !useWebview);

  const shots = useMemo(
    () => (liveUrl?.trim() ? buildScreenshotCandidates(liveUrl.trim()) : []),
    [liveUrl]
  );
  const [shotIdx, setShotIdx] = useState(0);
  const [shotLoaded, setShotLoaded] = useState(false);
  const [iframeOk, setIframeOk] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25);

  useEffect(() => {
    setShotIdx(0);
    setShotLoaded(false);
    setIframeOk(false);
  }, [liveUrl]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth || VIEWPORT_W;
      const h = el.clientHeight || VIEWPORT_H;
      // Cover-fit scale: fill the stage, no empty side gaps
      const next = Math.max(w / VIEWPORT_W, h / VIEWPORT_H);
      setScale(next);
      el.style.setProperty('--pw-scale', String(next));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [useWebview, liveUrl]);

  if (useWebview && liveUrl) {
    const shotSrc = shotIdx < shots.length ? shots[shotIdx] : null;
    const allShotsFailed = shotIdx >= shots.length;
    const host = hostnameOf(liveUrl);

    return (
      <div
        className={cn(
          'project-preview project-webview',
          slowScroll && 'project-webview-slow',
          className
        )}
      >
        <div className="project-webview-chrome" aria-hidden>
          <span className="project-webview-dot" />
          <span className="project-webview-dot" />
          <span className="project-webview-dot" />
          <span className="project-webview-url">{host}</span>
        </div>

        <div className="project-webview-stage" ref={stageRef}>
          {!shotLoaded && !allShotsFailed && (
            <div className="project-webview-loading" aria-hidden>
              <span className="project-webview-loading-bar" />
            </div>
          )}

          {shotSrc && (
            <img
              key={`${shotSrc}-${shotIdx}`}
              src={shotSrc}
              alt=""
              aria-hidden
              className={cn(
                'project-webview-shot',
                shotLoaded && 'is-loaded',
                slowScroll && shotLoaded && 'project-webview-pan'
              )}
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={(e) => {
                if (isUsableShot(e.currentTarget)) {
                  setShotLoaded(true);
                } else {
                  setShotIdx((i) => i + 1);
                }
              }}
              onError={() => {
                setShotLoaded(false);
                setShotIdx((i) => i + 1);
              }}
            />
          )}

          <iframe
            src={liveUrl}
            title={`${title} live preview`}
            className={cn(
              'project-webview-frame',
              slowScroll && iframeOk && !shotLoaded && 'project-webview-pan'
            )}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            referrerPolicy="no-referrer"
            tabIndex={-1}
            onLoad={() => setIframeOk(true)}
            style={{
              width: VIEWPORT_W,
              height: VIEWPORT_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              opacity: shotLoaded ? 0 : 1,
              zIndex: shotLoaded ? 0 : 1,
            }}
          />

          {allShotsFailed && !shotLoaded && (
            <div className="project-webview-fallback">
              <p className="project-webview-fallback-title">{title}</p>
              <p className="project-webview-fallback-host">{host}</p>
              <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="project-webview-fallback-link">
                Open site ↗
              </a>
            </div>
          )}
        </div>

        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="project-webview-hit"
          aria-label={`Open ${title}`}
        />
      </div>
    );
  }

  if (useImage && imageUrl) {
    return (
      <div className={cn('project-preview overflow-hidden', className)}>
        <img src={imageUrl} alt={title} className="w-full h-full object-cover object-top" loading="lazy" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'project-preview flex flex-col items-center justify-center gap-1 text-sm text-subtle bg-black/5 px-4 text-center',
        className
      )}
    >
      <span className="font-medium text-[var(--bento-ink,#1a1a1a)]">{title}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-60">Add image or live URL</span>
    </div>
  );
}
