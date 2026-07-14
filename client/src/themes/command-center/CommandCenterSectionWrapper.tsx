import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { SectionWrapperProps } from '../types';

export default function CommandCenterSectionWrapper({ children, id, className }: SectionWrapperProps) {
  return (
    <motion.div
      id={id}
      className={cn(className)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
