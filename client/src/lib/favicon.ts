const DEFAULT_ICON_PNG = '/brand/icon-32.png';
const DEFAULT_ICON_SVG = '/favicon.svg';
const DEFAULT_APPLE = '/brand/apple-touch-icon.png';

const FAVICON_SIZE = 64;
const FAVICON_BORDER = 4;
const DEFAULT_BORDER = '#0066FF';

let faviconGen = 0;

export type FaviconStyle = 'auto' | 'photo' | 'initials';

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

function contrastText(hex: string): string {
  const raw = hex.replace('#', '').trim();
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) || 0;
  const g = parseInt(full.slice(2, 4), 16) || 0;
  const b = parseInt(full.slice(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#0a0a0a' : '#ffffff';
}

/** 1–3 letters from a display name (e.g. "Simar Mann Singh" → "sms"). */
export function initialsFromName(name?: string | null): string {
  const parts = (name || '')
    .trim()
    .split(/\s+/)
    .map((p) => p.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);
  if (!parts.length) return 'BF';
  if (parts.length === 1) return parts[0].slice(0, 3).toLowerCase();
  if (parts.length === 2) {
    return (parts[0][0] + parts[1][0]).toLowerCase();
  }
  return (parts[0][0] + parts[1][0] + parts[parts.length - 1][0]).toLowerCase();
}

export function createInitialsFavicon(name: string, accentColor: string): string {
  const size = FAVICON_SIZE;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return DEFAULT_ICON_PNG;

  const fill = accentColor?.trim() || DEFAULT_BORDER;
  const radius = 12;

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.arcTo(size, 0, size, size, radius);
  ctx.arcTo(size, size, 0, size, radius);
  ctx.arcTo(0, size, 0, 0, radius);
  ctx.arcTo(0, 0, size, 0, radius);
  ctx.closePath();
  ctx.fill();

  const letters = initialsFromName(name);
  ctx.fillStyle = contrastText(fill);
  ctx.font = `bold ${letters.length >= 3 ? 22 : 26}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letters, size / 2, size / 2 + 1);

  return canvas.toDataURL('image/png');
}

/** Draw profile photo as a circle with theme-colored ring (transparent corners for the tab). */
function createCircularFavicon(src: string, borderColor: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
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

  applyIconHref(url, guessType(url));

  void createCircularFavicon(url, color)
    .then((dataUrl) => {
      if (gen !== faviconGen) return;
      applyIconHref(dataUrl, 'image/png', `${FAVICON_SIZE}x${FAVICON_SIZE}`);
    })
    .catch(() => {
      if (gen !== faviconGen) return;
      applyIconHref(url, guessType(url));
    });
}

export function setDocumentInitialsFavicon(name?: string | null, accentColor: string = DEFAULT_BORDER) {
  const gen = ++faviconGen;
  const dataUrl = createInitialsFavicon(name || 'Portfolio', accentColor?.trim() || DEFAULT_BORDER);
  if (gen !== faviconGen) return;
  applyIconHref(dataUrl, 'image/png', `${FAVICON_SIZE}x${FAVICON_SIZE}`);
}

/** Resolve photo vs initials from Personalization faviconStyle. */
export function applyPortfolioFavicon(opts: {
  name?: string | null;
  imageUrl?: string | null;
  accentColor?: string | null;
  style?: FaviconStyle | string | null;
}) {
  const color = opts.accentColor?.trim() || DEFAULT_BORDER;
  const style = (opts.style || 'auto') as FaviconStyle;
  const photo = opts.imageUrl?.trim();

  if (style === 'initials') {
    setDocumentInitialsFavicon(opts.name, color);
    return;
  }

  if (style === 'photo') {
    if (photo) setDocumentFavicon(photo, color);
    else setDocumentInitialsFavicon(opts.name, color);
    return;
  }

  // auto
  if (photo) setDocumentFavicon(photo, color);
  else setDocumentInitialsFavicon(opts.name, color);
}

export function restoreDocumentFavicon() {
  faviconGen += 1;
  document.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove());
  ensureLink('icon', { href: DEFAULT_ICON_PNG, type: 'image/png', sizes: '32x32' });
  ensureLink('icon', { href: DEFAULT_ICON_SVG, type: 'image/svg+xml' });
  ensureLink('apple-touch-icon', { href: DEFAULT_APPLE });
}
