import { cn } from '@/lib/utils';
import type { SectionWrapperProps } from '../types';

export default function GlassSectionWrapper({ children, id, className }: SectionWrapperProps) {
  return (
    <div id={id} className={cn(className)}>
      {children}
    </div>
  );
}
