import { motion } from 'framer-motion';
import { Container, Section, SectionHeading } from '@/components/layout/Section';
import type { ProfileContent } from '@/types';

export default function GlassAboutSection({
  content,
  showExperienceBadge = true,
}: {
  content: ProfileContent;
  showExperienceBadge?: boolean;
}) {
  return (
    <Section id="about">
      <Container>
        <SectionHeading number="01" title="About Me" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-[3fr_2fr] gap-12"
        >
          <div className="space-y-4 text-secondary leading-relaxed">
            {content.bio.split('\n').filter(Boolean).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="space-y-4">
            {content.profileImageUrl && (
              <img
                src={content.profileImageUrl}
                alt={content.name}
                className="rounded-2xl w-full max-w-xs mx-auto border border-border"
                loading="lazy"
              />
            )}
            {content.yearsExperience && showExperienceBadge && (
              <div className="glass-card p-4 text-center">
                <p className="text-3xl font-bold text-accent">{content.yearsExperience}</p>
                <p className="text-sm text-subtle font-mono">Years Experience</p>
              </div>
            )}
            {content.educationHighlight && (
              <div className="glass-card p-4">
                <p className="text-xs font-mono text-accent mb-1">Currently</p>
                <p className="text-sm text-secondary">{content.educationHighlight}</p>
              </div>
            )}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
