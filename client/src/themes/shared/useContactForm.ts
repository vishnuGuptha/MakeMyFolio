import { useState } from 'react';
import { toast } from 'sonner';
import { publicApi } from '@/api';
import { usePortfolioPreview } from '@/context/PortfolioContext';

export function useContactForm(slug: string) {
  const isPreview = usePortfolioPreview();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview) {
      toast.message('Contact form is disabled in draft preview.');
      return;
    }
    setSending(true);
    try {
      await publicApi.sendContact(slug, form);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const resetSent = () => setSent(false);

  return { form, setForm, sending, sent, resetSent, handleSubmit };
}
