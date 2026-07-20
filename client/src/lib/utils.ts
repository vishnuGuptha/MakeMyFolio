import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export { applyPortfolioTheme, applyAccentColor } from '@/lib/theme';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(displayName: string): string {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

import {
  getPortfolioHost,
  getPublicPortfolioLabel,
  getPublicSiteOrigin,
  usesSubdomainPortfolios,
} from '@/lib/domains';

export { getPublicPortfolioLabel };

/** Public portfolio path — short form `/{slug}` (legacy `/p/{slug}` redirects). */
export function getPublicPortfolioPath(slug: string, section?: string) {
  if (usesSubdomainPortfolios()) {
    return section ? `/${section}` : '/';
  }
  const base = `/${slug}`;
  return section ? `${base}/${section}` : base;
}

export function getPublicPortfolioUrl(slug: string, section?: string) {
  if (usesSubdomainPortfolios()) {
    const proto = window.location.protocol === 'http:' ? 'http' : 'https';
    const path = section ? `/${section}` : '';
    return `${proto}//${getPortfolioHost(slug)}${path}`;
  }
  return `${window.location.origin}${getPublicPortfolioPath(slug, section)}`;
}

/** Authenticated draft/live preview path for editors. */
export function getPreviewPortfolioPath(profileId: string, section?: string) {
  const base = `/preview/${profileId}`;
  return section ? `${base}/${section}` : base;
}

export function getPreviewPortfolioUrl(profileId: string) {
  return `${window.location.origin}${getPreviewPortfolioPath(profileId)}`;
}

/** Prefer live public URL when published; otherwise editor preview. */
export function getPortfolioViewPath(profile: { _id: string; slug: string; isPublished: boolean }) {
  return profile.isPublished
    ? getPublicPortfolioPath(profile.slug)
    : getPreviewPortfolioPath(profile._id);
}

export function getPortfolioViewUrl(profile: { _id: string; slug: string; isPublished: boolean }) {
  if (profile.isPublished && usesSubdomainPortfolios()) {
    return getPublicPortfolioUrl(profile.slug);
  }
  return `${getPublicSiteOrigin()}${getPortfolioViewPath(profile)}`;
}
