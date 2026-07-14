import { motion } from 'framer-motion';
import { Linkedin, Mail, Phone, Github, Globe } from 'lucide-react';
import { Container, Section, SectionHeading } from '@/components/layout/Section';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useContactForm } from '@/themes/shared/useContactForm';
import type { ProfileContent } from '@/types';

export default function GlassContactSection({
  content,
  slug,
}: {
  content: ProfileContent;
  slug: string;
}) {
  const { form, setForm, sending, handleSubmit } = useContactForm(slug);

  return (
    <Section id="contact">
      <Container>
        <SectionHeading number="09" title="Get In Touch" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12"
        >
          <div className="space-y-6">
            <p className="text-secondary leading-relaxed">
              I&apos;m currently open to new opportunities. Whether you have a question or just want to say hi,
              feel free to reach out!
            </p>
            <div className="space-y-3">
              {content.email && (
                <a href={`mailto:${content.email}`} className="flex items-center gap-3 text-secondary hover:text-accent transition-colors">
                  <Mail className="h-5 w-5 text-accent" /> {content.email}
                </a>
              )}
              {content.phone && (
                <a href={`tel:${content.phone}`} className="flex items-center gap-3 text-secondary hover:text-accent transition-colors">
                  <Phone className="h-5 w-5 text-accent" /> {content.phone}
                </a>
              )}
              {content.linkedin && (
                <a href={content.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-secondary hover:text-accent transition-colors">
                  <Linkedin className="h-5 w-5 text-accent" /> LinkedIn
                </a>
              )}
              {content.github && (
                <a href={content.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-secondary hover:text-accent transition-colors">
                  <Github className="h-5 w-5 text-accent" /> GitHub
                </a>
              )}
              {content.portfolioUrl && (
                <a href={content.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-secondary hover:text-accent transition-colors">
                  <Globe className="h-5 w-5 text-accent" /> Portfolio
                </a>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
            <Input placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Textarea placeholder="Your Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="min-h-[120px]" />
            <Button type="submit" disabled={sending} className="w-full">
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </motion.div>
      </Container>
    </Section>
  );
}
