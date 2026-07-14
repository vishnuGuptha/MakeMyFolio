/**
 * Resolve JWT secret. Production refuses to start with a missing or default secret.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    if (!secret || secret === 'dev-secret' || secret === 'change-me-to-a-long-random-string') {
      throw new Error(
        'JWT_SECRET must be set to a strong unique value in production (not the example/default).'
      );
    }
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production.');
    }
    return secret;
  }

  return secret || 'dev-secret';
}
