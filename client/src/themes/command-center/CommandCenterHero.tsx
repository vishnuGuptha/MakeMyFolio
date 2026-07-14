import { motion } from 'framer-motion';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { CommandCenterContainer } from './layout/CommandCenterSection';
import GlassCard from './components/GlassCard';
import CommandConsole from './components/CommandConsole';
import TypewriterHeadline from './components/TypewriterHeadline';
import GlowButton from './components/GlowButton';
import type { HeroProps } from '../types';

export default function CommandCenterHero({ content }: HeroProps) {
  const bioExcerpt = (content.bio || content.tagline || '').slice(0, 220);
  const headline = `Hi, I'm ${content.name}`;

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const statusLabel = content.location
    ? `Available · ${content.location}`
    : 'Open to opportunities';

  return (
    <section id="hero" className="min-h-[calc(100vh-5rem)] flex items-center pt-24 pb-8 relative z-10">
      <CommandCenterContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard hover={false} className="p-0 overflow-hidden w-full">
            <CommandConsole title={statusLabel} titleVariant="status">
              <p className="cc-console-prompt mb-4">&gt; initializing_profile.exe</p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 leading-tight">
                <TypewriterHeadline text={headline} />
              </h1>
              {content.title && (
                <p className="text-lg text-accent mb-4">{content.title}</p>
              )}
              {bioExcerpt && (
                <p className="text-sm text-subtle leading-relaxed mb-6 max-w-3xl">{bioExcerpt}</p>
              )}
              <div className="flex flex-wrap gap-3 mb-6">
                <GlowButton onClick={() => scrollTo('projects')}>View Projects</GlowButton>
                <GlowButton variant="secondary" onClick={() => scrollTo('contact')}>
                  Contact Me
                </GlowButton>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/5">
                <span className="text-[10px] uppercase tracking-widest text-subtle">Social</span>
                <SocialIconLinks
                  content={content}
                  size="sm"
                  linkClassName="text-subtle hover:text-accent"
                />
              </div>
            </CommandConsole>
          </GlassCard>
        </motion.div>
      </CommandCenterContainer>
    </section>
  );
}
