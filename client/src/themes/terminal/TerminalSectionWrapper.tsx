import { cn } from '@/lib/utils';
import type { SectionWrapperProps } from '../types';

export default function TerminalSectionWrapper({ children, id, className }: SectionWrapperProps) {
  return (
    <div id={id} className={cn('terminal-section', className)}>
      {children}
    </div>
  );
}
