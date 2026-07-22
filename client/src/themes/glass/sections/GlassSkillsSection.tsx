import { motion } from 'framer-motion';
import { Container, Section, SectionHeading } from '@/components/layout/Section';
import { Badge } from '@/components/ui/Badge';
import { usePortfolioData } from '@/context/PortfolioContext';
import {
  resolveSkillsDisplayStyle,
  SkillBarsLayout,
  SkillCardsLayout,
  SkillChipsLayout,
  SkillRingsLayout,
} from '@/themes/shared/skills';
import type { SkillCategory } from '@/types';

export default function GlassSkillsSection({ skills }: { skills: SkillCategory[] }) {
  const { settings } = usePortfolioData();
  const style = resolveSkillsDisplayStyle('glass', settings?.skillsDisplayStyle);

  return (
    <Section id="skills">
      <Container>
        <SectionHeading number="02" title="Technical Skills" />
        {style === 'rings' ? (
          <SkillRingsLayout skills={skills} />
        ) : style === 'bars' ? (
          <SkillBarsLayout
            skills={skills}
            renderCategory={(_cat, body) => <div className="glass-card p-6">{body}</div>}
          />
        ) : style === 'cards' ? (
          <SkillCardsLayout skills={skills} classNames={{ card: 'glass-card' }} />
        ) : (
          <SkillChipsLayout
            skills={skills}
            renderCategory={(_cat, body) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-6"
              >
                {body}
              </motion.div>
            )}
            renderChip={(skill) => <Badge variant="outline">{skill.name}</Badge>}
            classNames={{ root: 'grid md:grid-cols-2 gap-8 space-y-0' }}
          />
        )}
      </Container>
    </Section>
  );
}
