import { motion } from 'framer-motion';
import { SpotlightContainer } from '../layout/SpotlightSection';

export function SpotlightHighlightsSection({
  stats,
  tools,
  showStats = true,
  showAiStrip = true,
}: {
  stats: { label: string; value: string }[];
  tools: string[];
  showStats?: boolean;
  showAiStrip?: boolean;
}) {
  const hasStats = showStats && stats?.length > 0;
  const hasAi = showAiStrip && tools?.length > 0;
  if (!hasStats && !hasAi) return null;

  return (
    <section className="py-10">
      <SpotlightContainer className="space-y-4">
        {hasStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="spotlight-stat-card text-center p-5"
              >
                <p className="text-3xl font-bold spotlight-stat-value">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-widest text-subtle mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {hasAi && (
          <div className="spotlight-ai-strip flex flex-wrap items-center gap-2 px-5 py-4">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider mr-2">Built with</span>
            {tools.map((tool) => (
              <span key={tool} className="spotlight-ai-pill text-xs px-3 py-1 rounded-full">
                {tool}
              </span>
            ))}
          </div>
        )}
      </SpotlightContainer>
    </section>
  );
}
