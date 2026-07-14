import { cn } from '@/lib/utils';
import type { SectionWrapperProps } from '../types';

export default function SpotlightSectionWrapper({ children, id, className }: SectionWrapperProps) {
  return (
    <div id={id} className={cn('spotlight-section', className)}>
      {children}
    </div>
  );
}
