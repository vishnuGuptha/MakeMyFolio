import { TerminalContainer, TerminalSection } from '../layout/TerminalSection';
import TerminalWindow from '../components/TerminalWindow';

export function TerminalHighlightsSection({
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
    <TerminalSection id="highlights">
      <TerminalContainer>
        <TerminalWindow title="neofetch — stats">
          <div className="space-y-2">
            {hasStats && (
              <>
                <p className="text-accent text-xs">$ neofetch --stats</p>
                {stats.map((stat) => (
                  <p key={stat.label} className="terminal-output-line pl-2">
                    <span className="terminal-output-key">{stat.label}:</span>{' '}
                    <span className="terminal-output-value">{stat.value}</span>
                  </p>
                ))}
              </>
            )}
            {hasAi && (
              <>
                <p className="text-accent text-xs pt-2">$ which {tools.join(' ')}</p>
                <p className="terminal-output-line pl-2 text-subtle">
                  {tools.join('  ')}
                </p>
              </>
            )}
          </div>
        </TerminalWindow>
      </TerminalContainer>
    </TerminalSection>
  );
}
