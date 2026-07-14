import { createContext, useContext, ReactNode } from 'react';
import type { PortfolioData } from '@/types';

type PortfolioViewContext = {
  data: PortfolioData;
  /** Path prefix for in-portfolio links: `/{slug}` or `/preview/{profileId}` */
  basePath: string;
  isPreview: boolean;
};

const PortfolioContext = createContext<PortfolioViewContext | null>(null);

export function PortfolioProvider({
  data,
  basePath,
  isPreview = false,
  children,
}: {
  data: PortfolioData;
  basePath: string;
  isPreview?: boolean;
  children: ReactNode;
}) {
  return (
    <PortfolioContext.Provider value={{ data, basePath, isPreview }}>
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

/** Section numbers (01., 02., …) only on single-page scroll layout */
export function useShowSectionNumbers(): boolean {
  const ctx = useContext(PortfolioContext);
  if (!ctx) return true;
  return (ctx.data.settings?.layoutMode || 'single-page') !== 'multi-page';
}
