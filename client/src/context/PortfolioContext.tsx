import { createContext, useContext, ReactNode } from 'react';
import type { PortfolioData } from '@/types';

type PortfolioViewContext = {
  data: PortfolioData;
  /** Path prefix for in-portfolio links: `/{slug}` or `/preview/{profileId}` */
  basePath: string;
  isPreview: boolean;
  /** Public visitor still needs the access code (preview always false) */
  accessLocked: boolean;
  unlockWithCode: (code: string) => Promise<void>;
};

const PortfolioContext = createContext<PortfolioViewContext | null>(null);

export function PortfolioProvider({
  data,
  basePath,
  isPreview = false,
  accessLocked = false,
  unlockWithCode,
  children,
}: {
  data: PortfolioData;
  basePath: string;
  isPreview?: boolean;
  accessLocked?: boolean;
  unlockWithCode?: (code: string) => Promise<void>;
  children: ReactNode;
}) {
  return (
    <PortfolioContext.Provider
      value={{
        data,
        basePath,
        isPreview,
        accessLocked,
        unlockWithCode: unlockWithCode ?? (async () => undefined),
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioData() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolioData must be used within PortfolioProvider');
  return ctx.data;
}

export function usePortfolioBasePath() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolioBasePath must be used within PortfolioProvider');
  return ctx.basePath;
}

export function usePortfolioPreview() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolioPreview must be used within PortfolioProvider');
  return ctx.isPreview;
}

export function usePortfolioAccess() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolioAccess must be used within PortfolioProvider');
  return { accessLocked: ctx.accessLocked, unlockWithCode: ctx.unlockWithCode };
}

/** Section numbers (01., 02., …) — opt-in via Personalization; never on multi-page */
export function useShowSectionNumbers(): boolean {
  const ctx = useContext(PortfolioContext);
  if (!ctx) return false;
  const settings = ctx.data.settings;
  if ((settings?.layoutMode || 'single-page') === 'multi-page') return false;
  return Boolean(settings?.showSectionNumbers);
}
