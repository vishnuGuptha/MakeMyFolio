import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Linkedin, Mail, Phone, Send, Github, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useContactForm } from '@/themes/shared/useContactForm';
import { SpotlightContainer, SpotlightSection, SpotlightHeading } from '../layout/SpotlightSection';
import { fadeUp } from '../motion';
import type { ProfileContent } from '@/types';

export default function SpotlightContactSection({
  content,
  slug,
}: {
  content: ProfileContent;
  slug: string;
}) {
  const { form, setForm, sending, sent, resetSent, handleSubmit } = useContactForm(slug);
  const reduceMotion = useReducedMotion();

  return (
    <SpotlightSection id="contact">
      <SpotlightContainer>
        <div className="spotlight-contact-banner rounded-2xl p-8 md:p-12 mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-3">Let&apos;s work together</h2>
          <p className="text-subtle max-w-lg mx-auto">
            Have a project in mind or want to discuss an opportunity? Drop me a message — I usually reply within a couple of days.
          </p>
        </div>

        <SpotlightHeading number="09" title="Contact" />
        <motion.div
          variants={reduceMotion ? undefined : fadeUp}
          initial={reduceMotion ? false : 'hidden'}
          whileInView={reduceMotion ? undefined : 'show'}
          viewport={{ once: true }}
          className="grid lg:grid-cols-[1fr_1.2fr] gap-10"
        >
          <div className="space-y-4">
            {content.email ? (
              <a href={`mailto:${content.email}`} className="spotlight-contact-link flex items-center gap-3 p-4 rounded-xl">
                <Mail className="h-5 w-5 text-accent" />
                <span className="text-secondary">{content.email}</span>
              </a>
            ) : null}
            {content.phone ? (
              <a href={`tel:${content.phone}`} className="spotlight-contact-link flex items-center gap-3 p-4 rounded-xl">
                <Phone className="h-5 w-5 text-accent" />
                <span className="text-secondary">{content.phone}</span>
              </a>
            ) : null}
            {content.linkedin ? (
              <a
                href={content.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="spotlight-contact-link flex items-center gap-3 p-4 rounded-xl"
              >
                <Linkedin className="h-5 w-5 text-accent" />
                <span className="text-secondary">LinkedIn Profile</span>
              </a>
            ) : null}
            {content.github ? (
              <a
                href={content.github}
                target="_blank"
                rel="noopener noreferrer"
                className="spotlight-contact-link flex items-center gap-3 p-4 rounded-xl"
              >
                <Github className="h-5 w-5 text-accent" />
                <span className="text-secondary">GitHub</span>
              </a>
            ) : null}
            {content.portfolioUrl ? (
              <a
                href={content.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="spotlight-contact-link flex items-center gap-3 p-4 rounded-xl"
              >
                <Globe className="h-5 w-5 text-accent" />
                <span className="text-secondary">Portfolio</span>
              </a>
            ) : null}
          </div>

          {sent ? (
            <div className="spotlight-contact-success" role="status">
              <CheckCircle2 className="h-10 w-10 text-accent mx-auto mb-3" />
              <p className="text-lg font-semibold text-primary mb-1">Message sent</p>
              <p className="text-sm text-subtle mb-5 max-w-sm mx-auto">
                Thanks for reaching out. I&apos;ll get back to you soon.
              </p>
              <Button type="button" variant="outline" onClick={resetSent}>
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="spotlight-contact-form p-6 md:p-8 space-y-4">
              <Input
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="spotlight-input"
              />
              <Input
                type="email"
                placeholder="Your Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="spotlight-input"
              />
              <Textarea
                placeholder="Your Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                className="min-h-[120px] spotlight-input"
              />
              <Button type="submit" disabled={sending} className="w-full gap-2">
                <Send className="h-4 w-4" />
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          )}
        </motion.div>
      </SpotlightContainer>
    </SpotlightSection>
  );
}
