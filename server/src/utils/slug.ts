/** Slugs that collide with app routes or infrastructure hostnames. */
export const RESERVED_SLUGS = [
  'www',
  'api',
  'app',
  'admin',
  'cdn',
  'static',
  'mail',
  'try',
  'themes',
  'pricing',
  'examples',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'dashboard',
  'platform',
  'preview',
  'not-found',
  'p',
  'privacy',
  'terms',
] as const;

export function generateSlug(displayName: string): string {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug.toLowerCase());
}

export function isValidSlug(slug: string): boolean {
  if (isReservedSlug(slug)) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 60;
}

export async function ensureUniqueSlug(
  baseSlug: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug = isReservedSlug(baseSlug) ? `${baseSlug}-folio` : baseSlug;
  let counter = 2;
  while (isReservedSlug(slug) || (await checkExists(slug))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}
