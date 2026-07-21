/** Official BuildMyFolio brand constants */
export const BRAND = {
  name: 'BuildMyFolio',
  domain: import.meta.env.VITE_APP_DOMAIN || 'buildmyfolio.com',
  url: `https://${import.meta.env.VITE_APP_DOMAIN || 'buildmyfolio.com'}`,
  tagline: 'Turn a resume into a polished live portfolio — minutes, not weeks.',
  shortTagline: 'Your folio, live in minutes.',
} as const;

/** Path segments that must never be treated as portfolio slugs */
export const RESERVED_APP_PATHS = [
  'try',
  'themes',
  'pricing',
  'cart',
  'examples',
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'dashboard',
  'admin',
  'platform',
  'preview',
  'not-found',
  'p',
] as const;
