import { useState, useEffect } from 'react';
import { ArrowUp, Github, Linkedin, Mail, MapPin, Phone, Eye, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { publicApi } from '@/api';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/layout/Section';
import type { HeroProps } from '../types';

export default function GlassHero({ content, slug }: HeroProps) {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="hero" className="min-h-[calc(100vh-4rem)] gradient-mesh flex items-center">
      <Container className="py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl glass-panel p-8 md:p-10"
        >
          <p className="font-mono text-accent text-sm mb-4">Hi, my name is</p>
          <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-4 tracking-tight">
            {content.name}.
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-secondary mb-6">
            {content.title}
          </h2>
          <p className="text-lg text-subtle max-w-2xl mb-4 leading-relaxed">{content.tagline}</p>
          <div className="flex flex-wrap gap-4 text-sm text-subtle mb-8">
            {content.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-accent" /> {content.location}
              </span>
            )}
            {content.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-accent" /> {content.phone}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-10">
            <Button size="lg" onClick={() => scrollTo('contact')}>
              Get In Touch
            </Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo('projects')}>
              View Projects
            </Button>
            {content.resumeUrl && (
              <>
                <Button size="lg" variant="outline" asChild>
                  <a
                    href={publicApi.getResumeUrl(slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary"
                  >
                    <Eye className="h-4 w-4 shrink-0" /> View Resume
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a
                    href={publicApi.getResumeUrl(slug, true)}
                    download
                    className="text-primary"
                  >
                    <Download className="h-4 w-4 shrink-0" /> Download Resume
                  </a>
                </Button>
              </>
            )}
          </div>

          <div className="flex gap-4">
            {content.linkedin && (
              <a href={content.linkedin} target="_blank" rel="noopener noreferrer" className="text-subtle hover:text-accent transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {content.github && (
              <a href={content.github} target="_blank" rel="noopener noreferrer" className="text-subtle hover:text-accent transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            )}
            {content.email && (
              <a href={`mailto:${content.email}`} className="text-subtle hover:text-accent transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            )}
          </div>
        </motion.div>
      </Container>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-30 rounded-full bg-accent p-3 text-white shadow-lg hover:bg-accent-hover transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </section>
  );
}
