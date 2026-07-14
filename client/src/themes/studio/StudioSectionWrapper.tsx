import { ReactNode } from 'react';
import type { SectionWrapperProps } from '../types';

export default function StudioSectionWrapper({ children }: SectionWrapperProps) {
  return <>{children as ReactNode}</>;
}
