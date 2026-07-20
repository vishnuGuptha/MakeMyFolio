import { RESERVED_APP_PATHS } from '@/brand/constants';

/** Apex domain for the app (marketing, dashboard). */
export function getAppDomain(): string {
  return import.meta.env.VITE_APP_DOMAIN || 'buildmyfolio.com';
}

/**
 * `path` → buildmyfolio.com/vishnu · `subdomain` → vishnu.buildmyfolio.com
 * Defaults to subdomain unless explicitly set to `path` (useful for local path testing).
 */
export function usesSubdomainPortfolios(): boolean {
  return import.meta.env.VITE_PORTFOLIO_URL_MODE !== 'path';
}

/** Subdomains / slugs that must never map to a portfolio. */
export const RESERVED_SUBDOMAINS = [
  'www',
  'api',
  'app',
  'admin',
  'cdn',
  'static',
  'mail',
  'privacy',
  'terms',
  ...RESERVED_APP_PATHS,
] as const;

export function getPublicSiteOrigin(): string {
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    const domain = getAppDomain();
    if (hostname === domain || hostname === `www.${domain}` || hostname.endsWith(`.${domain}`)) {
      return `${protocol}//${domain}`;
    }
    return window.location.origin;
  }
  return `https://${getAppDomain()}`;
}

export function getPortfolioHost(slug: string): string {
  return `${slug}.${getAppDomain()}`;
}

/** Human-readable public URL label (no protocol). */
export function getPublicPortfolioLabel(slug: string): string {
  return usesSubdomainPortfolios()
    ? getPortfolioHost(slug)
    : `${getAppDomain()}/${slug}`;
}

/** Resolve portfolio slug from a tenant subdomain, if any. */
export function getPortfolioSlugFromHost(hostname = typeof window !== 'undefined' ? window.location.hostname : ''): string | null {
  if (!usesSubdomainPortfolios() || !hostname) return null;

  const domain = getAppDomain();
  if (hostname === domain || hostname === `www.${domain}` || hostname === 'localhost') {
    return null;
  }

  const suffix = `.${domain}`;
  if (!hostname.endsWith(suffix)) return null;

  const slug = hostname.slice(0, -suffix.length);
  if (!slug || slug.includes('.') || (RESERVED_SUBDOMAINS as readonly string[]).includes(slug)) {
    return null;
  }

  return slug;
}

export function getPortfolioUrlPlaceholder(): string {
  return usesSubdomainPortfolios()
    ? `your-name.${getAppDomain()}`
    : `${getAppDomain()}/your-name`;
}

export function isPortfolioSubdomainHost(hostname = typeof window !== 'undefined' ? window.location.hostname : ''): boolean {
  return getPortfolioSlugFromHost(hostname) !== null;
}
