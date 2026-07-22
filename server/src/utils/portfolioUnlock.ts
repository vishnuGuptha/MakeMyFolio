import crypto from 'crypto';

function secret() {
  return process.env.JWT_SECRET || 'dev-secret';
}

/** Session unlock token for a locked public portfolio (valid ~12h). */
export function signUnlockToken(slug: string, profileId: string): string {
  const exp = Date.now() + 12 * 60 * 60 * 1000;
  const payload = `${slug}.${profileId}.${exp}`;
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyUnlockToken(token: string, slug: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 4) return false;
  const [tokenSlug, profileId, expStr, sig] = parts;
  if (tokenSlug !== slug || !profileId || !expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const payload = `${tokenSlug}.${profileId}.${expStr}`;
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}
