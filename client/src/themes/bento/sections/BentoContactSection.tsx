import { useContactForm } from '@/themes/shared/useContactForm';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import BentoCard from '../components/BentoCard';
import { BentoSection } from '../BentoSectionWrapper';
import type { ProfileContent } from '@/types';

export default function BentoContactSection({
  content,
  slug,
}: {
  content: ProfileContent;
  slug: string;
}) {
  const { form, setForm, sending, handleSubmit } = useContactForm(slug);

  return (
    <BentoSection id="contact" label="09" title="Get in touch">
      <div className="grid md:grid-cols-2 gap-4">
        <BentoCard className="p-6 md:p-8 space-y-5">
          <p className="text-sm bento-muted leading-relaxed">
            Open to new opportunities and collaborations. Send a message — I&apos;ll get back to you.
          </p>
          <div className="space-y-3 text-sm">
            {content.email && (
              <a href={`mailto:${content.email}`} className="block font-medium hover:opacity-70">
                {content.email}
              </a>
            )}
            {content.phone && (
              <a href={`tel:${content.phone}`} className="block font-medium hover:opacity-70">
                {content.phone}
              </a>
            )}
          </div>
          <SocialIconLinks
            content={content}
            exclude={['email']}
            linkClassName="text-[var(--bento-ink)] bg-black/5 hover:bg-black/10"
          />
        </BentoCard>

        <BentoCard className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="bento-input"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="bento-input"
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <textarea
              className="bento-textarea min-h-[120px] resize-y"
              placeholder="Your message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
            <button type="submit" disabled={sending} className="bento-submit text-white">
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </BentoCard>
      </div>
    </BentoSection>
  );
}
