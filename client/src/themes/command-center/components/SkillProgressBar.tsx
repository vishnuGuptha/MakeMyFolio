import { motion } from 'framer-motion';

export default function SkillProgressBar({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full min-w-0">
      <div className="flex items-center justify-between gap-2 mb-1">
        {label && <span className="text-[10px] text-subtle uppercase tracking-wide">{label}</span>}
        <span className="text-[10px] text-accent tabular-nums">{clamped}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--secondary))]"
          initial={{ width: 0 }}
          whileInView={{ width: `${clamped}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
