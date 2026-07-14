import { motion } from 'framer-motion';
import { Container, Section, SectionHeading } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import type { SkillCategory } from '@/types';

export default function GlassSkillsSection({ skills }: { skills: SkillCategory[] }) {
  return (
    <Section id="skills">
      <Container>
        <SectionHeading number="02" title="Technical Skills" />
        <div className="grid md:grid-cols-2 gap-8">
          {skills.map((cat, i) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="font-mono text-sm text-accent mb-4">{cat.name}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills
                  .sort((a, b) => a.order - b.order)
                  .map((skill) => (
                    <Badge key={skill.name} variant="outline">
                      {skill.name}
                    </Badge>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
