import BentoCard from '../components/BentoCard';

export default function BentoHighlightsSection({
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
    <section className="pb-2">
      <div className="bento-container space-y-4">
        {hasStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {stats.map((stat) => (
              <BentoCard key={stat.label} className="p-5 md:p-6 text-center">
                <p className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--bento-ink)]">{stat.value}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.14em] bento-muted font-semibold">
                  {stat.label}
                </p>
              </BentoCard>
            ))}
          </div>
        )}
        {hasAi && (
          <BentoCard variant="soft" className="px-5 py-4 flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.14em] font-semibold mr-2">
              AI Tools
            </span>
            {tools.map((tool) => (
              <span key={tool} className="bento-chip">
                {tool}
              </span>
            ))}
          </BentoCard>
        )}
      </div>
    </section>
  );
}
