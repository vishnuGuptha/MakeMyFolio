import { TerminalContainer, TerminalSection, TerminalHeading } from '../layout/TerminalSection';
import TerminalWindow from '../components/TerminalWindow';
import { usePortfolioData } from '@/context/PortfolioContext';
import {
  resolveSkillsDisplayStyle,
  SkillBarsLayout,
  SkillCardsLayout,
  SkillChipsLayout,
  SkillRingsLayout,
} from '@/themes/shared/skills';
import type { SkillCategory } from '@/types';

export default function TerminalSkillsSection({ skills }: { skills: SkillCategory[] }) {
  const { settings } = usePortfolioData();
  const style = resolveSkillsDisplayStyle('terminal', settings?.skillsDisplayStyle);

  return (
    <TerminalSection id="skills">
      <TerminalContainer>
        <TerminalHeading number="02" title="Skills" command="ls -1 skills/" />
        {style === 'rings' ? (
          <SkillRingsLayout
            skills={skills}
            renderCategory={(cat, body) => (
              <TerminalWindow title={`skills/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}>{body}</TerminalWindow>
            )}
          />
        ) : style === 'chips' ? (
          <SkillChipsLayout
            skills={skills}
            classNames={{ chip: 'font-mono text-xs border-accent/30 text-accent' }}
            renderCategory={(cat, body) => (
              <TerminalWindow title={`skills/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}>{body}</TerminalWindow>
            )}
          />
        ) : style === 'cards' ? (
          <SkillCardsLayout skills={skills} />
        ) : (
          <SkillBarsLayout
            skills={skills}
            classNames={{ barFill: 'bg-accent', barLabel: 'font-mono text-xs' }}
            renderCategory={(cat, body) => (
              <TerminalWindow title={`skills/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <p className="text-accent text-xs mb-3">$ ls -1 {cat.name}/</p>
                {body}
              </TerminalWindow>
            )}
          />
        )}
      </TerminalContainer>
    </TerminalSection>
  );
}
