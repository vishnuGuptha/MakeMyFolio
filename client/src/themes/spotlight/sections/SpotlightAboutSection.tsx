import { motion } from 'framer-motion';
import { SpotlightContainer, SpotlightSection, SpotlightHeading } from '../layout/SpotlightSection';
import GithubSparkline from '../components/GithubSparkline';
import type { ProfileContent } from '@/types';

export default function SpotlightAboutSection({
  content,
  showExperienceBadge = true,
}: {
  content: ProfileContent;
  showExperienceBadge?: boolean;
}) {
  return (
    <SpotlightSection id="about">
      <SpotlightContainer>
        <SpotlightHeading number="01" title="About Me" subtitle="A quick snapshot of who I am and what I do." />
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-[1fr_280px] gap-10"
        >
          <div className="space-y-6">
            <div className="spotlight-about-prose space-y-5 text-secondary leading-relaxed border-l-2 border-accent/40 pl-6">
              {content.bio.split('\n').filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <GithubSparkline githubUrl={content.github} />
          </div>

          <div className="space-y-4">
            {content.yearsExperience && showExperienceBadge ? (
              <div className="spotlight-side-card p-5 text-center">
                <p className="text-4xl font-bold text-accent">{content.yearsExperience}</p>
                <p className="text-xs uppercase tracking-widest text-subtle mt-1">Years Exp.</p>
              </div>
            ) : null}
            {content.educationHighlight ? (
              <div className="spotlight-side-card p-5">
                <p className="text-[10px] uppercase tracking-widest text-accent mb-2">Currently</p>
                <p className="text-sm text-primary">{content.educationHighlight}</p>
              </div>
            ) : null}
          </div>
        </motion.div>
      </SpotlightContainer>
    </SpotlightSection>
  );
}
