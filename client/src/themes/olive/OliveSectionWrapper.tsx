import type { ReactNode } from 'react';
import type { SectionWrapperProps } from '../types';

export default function OliveSectionWrapper({ children }: SectionWrapperProps) {
  return <>{children as ReactNode}</>;
}
