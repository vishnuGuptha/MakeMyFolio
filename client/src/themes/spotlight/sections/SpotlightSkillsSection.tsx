import { motion } from 'framer-motion';
import { SpotlightContainer, SpotlightSection, SpotlightHeading } from '../layout/SpotlightSection';
import type { SkillCategory } from '@/types';

export default function SpotlightSkillsSection({ skills }: { skills: SkillCategory[] }) {
  return (
    <SpotlightSection id="skills">
      <SpotlightContainer>
        <SpotlightHeading number="02" title="Skills & Tools" subtitle="Technologies I work with day to day." />
        <div className="space-y-8">
          {skills.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <h3 className="font-mono text-sm text-accent mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {cat.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills
                  .sort((a, b) => a.order - b.order)
                  .map((skill) => (
                    <span key={skill.name} className="spotlight-skill-pill text-sm px-4 py-2 rounded-lg">
                      {skill.name}
                      {skill.level && (
                        <span className="ml-2 text-[10px] text-subtle uppercase">{skill.level}</span>
                      )}
                    </span>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      </SpotlightContainer>
    </SpotlightSection>
  );
}
