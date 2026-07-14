import { useState } from 'react';
import { toast } from 'sonner';
import { publicApi } from '@/api';
import { usePortfolioPreview } from '@/context/PortfolioContext';
import type { ContactSectionProps } from '../../types';
import StudioSection, { StudioSectionHeader } from '../layout/StudioSection';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import StudioGlowButton from '../components/StudioGlowButton';
import { StudioField, StudioInput, StudioTextarea } from '../components/StudioField';

type Errors = Partial<Record<'email' | 'mobile' | 'message', string>>;

function validate(email: string, mobile: string, message: string): Errors {
  const errors: Errors = {};
  if (!email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email.';
  if (!mobile.trim()) errors.mobile = 'Mobile is required.';
  else if (mobile.trim().length < 7) errors.mobile = 'Enter a valid mobile number.';
  if (!message.trim()) errors.message = 'Message is required.';
  else if (message.trim().length < 10) errors.message = 'Please write at least 10 characters.';
  return errors;
}

export default function StudioContactSection({ content, slug }: ContactSectionProps) {
  const isPreview = usePortfolioPreview();
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      toast.message('Contact form is disabled in draft preview.');
      return;
    }
    const next = validate(email, mobile, message);
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    try {
      await publicApi.sendContact(slug, {
        name: mobile.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      toast.success('Message sent successfully!');
      setEmail('');
      setMobile('');
      setMessage('');
      setErrors({});
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <StudioSection id="contact" band="dark" className="studio-contact">
      <StudioSectionHeader
        title="Get In Touch"
        lead={
          content.tagline ||
          'Open to new collaborations — drop a note and I’ll get back to you.'
        }
      />
      <SocialIconLinks
        content={content}
        className="justify-center mb-8"
        linkClassName="text-[var(--band-muted)] hover:text-[var(--band-ink)] border border-[var(--band-border)] hover:border-[var(--studio-accent)]"
      />
      <form className="studio-form" onSubmit={handleSubmit} noValidate>
        <StudioField label="Email" error={errors.email}>
          <StudioInput
            type="email"
            placeholder="Please enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
          />
        </StudioField>
        <StudioField label="Mobile" error={errors.mobile}>
          <StudioInput
            type="tel"
            placeholder="Enter mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            aria-invalid={Boolean(errors.mobile)}
            autoComplete="tel"
          />
        </StudioField>
        <StudioField label="Message" error={errors.message}>
          <StudioTextarea
            placeholder="Enter your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-invalid={Boolean(errors.message)}
          />
        </StudioField>
        <StudioGlowButton type="submit" block disabled={sending}>
          {sending ? 'Sending…' : 'Submit >'}
        </StudioGlowButton>
      </form>
    </StudioSection>
  );
}
