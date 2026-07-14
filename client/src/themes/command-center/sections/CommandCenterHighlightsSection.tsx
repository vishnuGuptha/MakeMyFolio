import { motion } from 'framer-motion';
import { usePortfolioData } from '@/context/PortfolioContext';
import { CommandCenterContainer } from '../layout/CommandCenterSection';
import GlassCard from '../components/GlassCard';
import CountUp from '../components/CountUp';
import { getDisplayStats } from '../utils/deriveMetrics';

export function CommandCenterHighlightsSection({
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
  const portfolio = usePortfolioData();
  const displayStats = getDisplayStats(
    stats,
    portfolio.content,
    portfolio.projects,
    portfolio.skills,
    portfolio.certifications,
    portfolio.experiences
  );

  const hasStats = showStats && displayStats.length > 0;
  const hasAi = showAiStrip && tools?.length > 0;
  if (!hasStats && !hasAi) return null;

  return (
    <section className="py-4 md:py-6">
      <CommandCenterContainer className="space-y-3">
        {hasStats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard hover={false} className="p-0 overflow-hidden">
              <div className="cc-stat-ribbon">
                {displayStats.map((stat) => (
                  <div key={stat.label} className="cc-stat-cell">
                    <p className="text-xl md:text-2xl font-bold text-primary">
                      <CountUp value={stat.value} />
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-subtle mt-1.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {hasAi && (
          <GlassCard hover={false}>
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle mb-3">AI &amp; Tools</p>
            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => (
                <span key={tool} className="cc-tech-tag">{tool}</span>
              ))}
            </div>
          </GlassCard>
        )}
      </CommandCenterContainer>
    </section>
  );
}
