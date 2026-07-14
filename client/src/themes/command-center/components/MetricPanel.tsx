import { motion } from 'framer-motion';

export default function MetricPanel({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress?: number;
}) {
  return (
    <div>
      <p className="text-xs text-subtle mb-1">{label}</p>
      <p className="text-xl font-bold text-primary">{value}</p>
      {progress !== undefined && (
        <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--secondary))]"
            initial={{ width: 0 }}
            whileInView={{ width: `${Math.min(100, progress)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      )}
    </div>
  );
}
