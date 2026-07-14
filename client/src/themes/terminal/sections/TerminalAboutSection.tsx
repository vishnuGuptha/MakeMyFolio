import { TerminalContainer, TerminalSection, TerminalHeading } from '../layout/TerminalSection';
import TerminalWindow from '../components/TerminalWindow';
import type { ProfileContent } from '@/types';

export default function TerminalAboutSection({
  content,
  showExperienceBadge = true,
}: {
  content: ProfileContent;
  showExperienceBadge?: boolean;
}) {
  return (
    <TerminalSection id="about">
      <TerminalContainer>
        <TerminalHeading number="01" title="About Me" command="man about" />
        <TerminalWindow title="less about.md">
          <div className="space-y-4">
            {content.yearsExperience && showExperienceBadge && (
              <p className="terminal-output-line">
                <span className="text-secondary">export</span>{' '}
                <span className="text-accent">YEARS</span>=
                <span className="text-primary">&quot;{content.yearsExperience}&quot;</span>
              </p>
            )}
            {content.educationHighlight && (
              <p className="terminal-output-line">
                <span className="text-secondary">export</span>{' '}
                <span className="text-accent">EDUCATION</span>=
                <span className="text-primary">&quot;{content.educationHighlight}&quot;</span>
              </p>
            )}
            <div className="pt-2 space-y-3 text-subtle leading-relaxed">
              {content.bio.split('\n').filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </TerminalWindow>
      </TerminalContainer>
    </TerminalSection>
  );
}
