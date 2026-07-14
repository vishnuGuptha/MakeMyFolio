import { motion } from 'framer-motion';
import { CommandCenterContainer, CommandCenterSection, CommandCenterHeading } from '../layout/CommandCenterSection';
import GlassCard from '../components/GlassCard';
import SkillProgressBar from '../components/SkillProgressBar';
import type { SkillCategory } from '@/types';

function levelToPercent(level?: string): number {
  if (!level) return 80;
  const map: Record<string, number> = {
    beginner: 40,
    intermediate: 60,
    advanced: 80,
    expert: 95,
  };
  const key = level.toLowerCase();
  if (map[key]) return map[key];
  const num = parseInt(level, 10);
  if (!isNaN(num)) return Math.min(100, num);
  return 75;
}

export default function CommandCenterSkillsSection({ skills }: { skills: SkillCategory[] }) {
  if (!skills.length) return null;

  return (
    <CommandCenterSection id="skills">
      <CommandCenterContainer>
        <CommandCenterHeading number="02" title="Skills" />
        <div className="grid md:grid-cols-2 gap-4">
          {skills.map((cat, ci) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.04 }}
            >
              <GlassCard hover={false}>
                <p className="text-sm font-semibold text-accent mb-4">{cat.name}</p>
                <div className="space-y-4">
                  {cat.skills.sort((a, b) => a.order - b.order).map((skill) => (
                    <div key={`${cat._id}-${skill.name}`}>
                      <span className="text-sm text-primary block mb-1.5">{skill.name}</span>
                      <SkillProgressBar value={levelToPercent(skill.level)} />
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </CommandCenterContainer>
    </CommandCenterSection>
  );
}
