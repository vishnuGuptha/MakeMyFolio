import { useState } from 'react';
import { toast } from 'sonner';
import { publicApi } from '@/api';
import { usePortfolioData, usePortfolioPreview } from '@/context/PortfolioContext';
import type { ContactSectionProps } from '../../types';
import OliveSection, { OliveSectionHeader } from '../components/OliveSection';
import OliveButton from '../components/OliveButton';
import { OliveContactLinks } from '../components/OliveContactBlocks';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

function validate(name: string, email: string, message: string): Errors {
  const errors: Errors = {};
  if (!name.trim()) errors.name = 'Name is required.';
  if (!email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email.';
  if (!message.trim()) errors.message = 'Message is required.';
  else if (message.trim().length < 10) errors.message = 'Please write at least 10 characters.';
  return errors;
}

export default function OliveContactSection({ content, slug }: ContactSectionProps) {
  const { settings } = usePortfolioData();
  const isPreview = usePortfolioPreview();
  const isSingle = (settings?.layoutMode || 'single-page') === 'single-page';
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      toast.message('Contact form is disabled in draft preview.');
      return;
    }
    const next = validate(form.name, form.email, form.message);
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    try {
      await publicApi.sendContact(slug, {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
      setErrors({});
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <OliveSection id="contact" panel="island">
      <OliveSectionHeader title="Get in touch" />
      {!isSingle && (
        <div className="olive-contact-panel-wrap">
          <OliveContactLinks content={content} />
        </div>
      )}
      <form className="olive-form" onSubmit={handleSubmit} noValidate>
        <div className="olive-field">
          <label htmlFor="olive-contact-name">Name</label>
          <input
            id="olive-contact-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your name"
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="olive-field-error">{errors.name}</p>}
        </div>
        <div className="olive-field">
          <label htmlFor="olive-contact-email">Email</label>
          <input
            id="olive-contact-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="olive-field-error">{errors.email}</p>}
        </div>
        <div className="olive-field">
          <label htmlFor="olive-contact-message">Message</label>
          <textarea
            id="olive-contact-message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="How can we collaborate?"
            aria-invalid={!!errors.message}
          />
          {errors.message && <p className="olive-field-error">{errors.message}</p>}
        </div>
        <OliveButton type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send message'}
        </OliveButton>
      </form>
    </OliveSection>
  );
}
