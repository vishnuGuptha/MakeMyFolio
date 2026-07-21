const DEFAULT_ICON_PNG = '/brand/icon-32.png';
const DEFAULT_ICON_SVG = '/favicon.svg';
const DEFAULT_APPLE = '/brand/apple-touch-icon.png';

const FAVICON_SIZE = 64;
const FAVICON_BORDER = 4;
const DEFAULT_BORDER = '#0066FF';

let faviconGen = 0;

function ensureLink(rel: string, attrs: Record<string, string>): HTMLLinkElement {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  for (const [key, value] of Object.entries(attrs)) {
    link.setAttribute(key, value);
  }
  return link;
}

function guessType(url: string): string {
  const lower = url.split('?')[0]?.toLowerCase() ?? '';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return 'image/png';
}

function applyIconHref(href: string, type: string, sizes?: string) {
  document.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove());
  ensureLink('icon', {
    href,
    type,
    ...(sizes ? { sizes } : { sizes: 'any' }),
  });
  ensureLink('apple-touch-icon', { href });
}

/** Draw profile photo as a circle with theme-colored ring (transparent corners for the tab). */
function createCircularFavicon(src: string, borderColor: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Same-origin /uploads work; anonymous helps when CDN sends CORS.
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = FAVICON_SIZE;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No canvas'));
          return;
        }

        const cx = size / 2;
        const cy = size / 2;
        const border = FAVICON_BORDER;
        const photoR = cx - border;

        ctx.clearRect(0, 0, size, size);

        // Photo (cover-fit, clipped to circle)
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, photoR, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        ctx.restore();

        // Theme ring
        ctx.beginPath();
        ctx.arc(cx, cy, cx - border / 2, 0, Math.PI * 2);
        ctx.strokeStyle = borderColor || DEFAULT_BORDER;
        ctx.lineWidth = border;
        ctx.lineCap = 'round';
        ctx.stroke();

        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

/**
 * Set tab favicon to a rounded portfolio photo with theme border,
 * or restore brand defaults when no image is provided.
 */
export function setDocumentFavicon(
  imageUrl?: string | null,
  borderColor: string = DEFAULT_BORDER
) {
  const url = imageUrl?.trim();
  if (!url) {
    restoreDocumentFavicon();
    return;
  }

  const gen = ++faviconGen;
  const color = borderColor?.trim() || DEFAULT_BORDER;

  // Optimistic raw icon while the circular version renders
  applyIconHref(url, guessType(url));

  void createCircularFavicon(url, color)
    .then((dataUrl) => {
      if (gen !== faviconGen) return;
      applyIconHref(dataUrl, 'image/png', `${FAVICON_SIZE}x${FAVICON_SIZE}`);
    })
    .catch(() => {
      // Keep raw image if canvas/CORS fails
      if (gen !== faviconGen) return;
      applyIconHref(url, guessType(url));
    });
}

export function restoreDocumentFavicon() {
  faviconGen += 1;
  document.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove());
  ensureLink('icon', { href: DEFAULT_ICON_PNG, type: 'image/png', sizes: '32x32' });
  ensureLink('icon', { href: DEFAULT_ICON_SVG, type: 'image/svg+xml' });
  ensureLink('apple-touch-icon', { href: DEFAULT_APPLE });
}
