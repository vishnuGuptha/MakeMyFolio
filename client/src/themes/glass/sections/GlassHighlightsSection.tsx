import { Container } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';

export function GlassHighlightsSection({
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
    <section className="relative py-8">
      <Container className="space-y-6">
        {hasStats && (
          <div className="glass-panel p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center space-y-2">
                  <p className="text-3xl md:text-4xl font-bold text-gradient leading-none">{stat.value}</p>
                  <p className="text-xs font-mono text-subtle uppercase tracking-wider leading-snug px-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasAi && (
          <div className="glass-card px-6 py-5 flex flex-wrap items-center justify-center gap-3">
            <span className="font-mono text-xs text-accent font-medium">AI-Assisted Development</span>
            {tools.map((tool) => (
              <Badge key={tool} variant="accent">{tool}</Badge>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
