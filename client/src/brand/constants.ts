/** Official MakeMyFolio brand constants */
export const BRAND = {
  name: 'MakeMyFolio',
  domain: 'makemyfolio.ai',
  url: 'https://makemyfolio.ai',
  tagline: 'Turn a resume into a polished live portfolio — minutes, not weeks.',
  shortTagline: 'Your folio, live in minutes.',
} as const;

/** Path segments that must never be treated as portfolio slugs */
export const RESERVED_APP_PATHS = [
  'try',
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
