/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** Apex domain, e.g. buildmyfolio.com */
  readonly VITE_APP_DOMAIN: string;
  /** `path` (default) or `subdomain` for {slug}.domain URLs */
  readonly VITE_PORTFOLIO_URL_MODE: 'path' | 'subdomain';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
