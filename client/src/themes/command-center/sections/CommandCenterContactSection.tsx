import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useContactForm } from '@/themes/shared/useContactForm';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { CommandCenterContainer, CommandCenterSection, CommandCenterHeading } from '../layout/CommandCenterSection';
import GlassCard from '../components/GlassCard';
import CommandConsole from '../components/CommandConsole';
import type { ProfileContent } from '@/types';

export default function CommandCenterContactSection({
  content,
  slug,
}: {
  content: ProfileContent;
  slug: string;
}) {
  const { form, setForm, sending, handleSubmit } = useContactForm(slug);

  return (
    <CommandCenterSection id="contact">
      <CommandCenterContainer>
        <CommandCenterHeading number="09" title="Contact" />
        <GlassCard hover={false} className="p-0 overflow-hidden max-w-2xl mx-auto">
          <CommandConsole title="MESSAGE CONSOLE">
            {content.email && (
              <p className="text-sm text-subtle mb-3">
                Reach me at <span className="text-accent">{content.email}</span>
                {content.phone && <> or <span className="text-accent">{content.phone}</span></>}
              </p>
            )}

            <SocialIconLinks
              content={content}
              size="sm"
              className="mb-5"
              exclude={['email']}
              linkClassName="text-subtle hover:text-accent bg-white/5 hover:bg-white/10"
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-subtle block mb-1.5">Name</label>
                <Input
                  className="cc-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-subtle block mb-1.5">Email</label>
                <Input
                  type="email"
                  className="cc-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-subtle block mb-1.5">Message</label>
                <Textarea
                  className="cc-input min-h-[120px]"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={sending} className="cc-btn-primary w-full sm:w-auto">
                {sending ? 'Sending…' : 'Send Message'}
              </Button>
            </form>
          </CommandConsole>
        </GlassCard>
      </CommandCenterContainer>
    </CommandCenterSection>
  );
}
