import { TerminalContainer, TerminalSection, TerminalHeading } from '../layout/TerminalSection';
import TerminalWindow from '../components/TerminalWindow';
import SkillBar from '../components/SkillBar';
import type { SkillCategory } from '@/types';

export default function TerminalSkillsSection({ skills }: { skills: SkillCategory[] }) {
  return (
    <TerminalSection id="skills">
      <TerminalContainer>
        <TerminalHeading number="02" title="Skills" command="ls -1 skills/" />
        <div className="space-y-6">
          {skills.map((cat) => (
            <TerminalWindow key={cat._id} title={`skills/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}>
              <p className="text-accent text-xs mb-3">$ ls -1 {cat.name}/</p>
              <div className="space-y-2">
                {cat.skills
                  .sort((a, b) => a.order - b.order)
                  .map((skill) => (
                    <SkillBar key={skill.name} name={skill.name} level={skill.level} />
                  ))}
              </div>
            </TerminalWindow>
          ))}
        </div>
      </TerminalContainer>
    </TerminalSection>
  );
}
