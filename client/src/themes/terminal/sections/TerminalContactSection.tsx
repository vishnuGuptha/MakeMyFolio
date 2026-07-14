import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useContactForm } from '@/themes/shared/useContactForm';
import SocialIconLinks from '@/themes/shared/SocialIconLinks';
import { TerminalContainer, TerminalSection, TerminalHeading } from '../layout/TerminalSection';
import TerminalWindow from '../components/TerminalWindow';
import type { ProfileContent } from '@/types';

export default function TerminalContactSection({
  content,
  slug,
}: {
  content: ProfileContent;
  slug: string;
}) {
  const { form, setForm, sending, handleSubmit } = useContactForm(slug);

  return (
    <TerminalSection id="contact">
      <TerminalContainer>
        <TerminalHeading number="09" title="Contact" command={`mail -s "Hello" ${content.email || 'user'}`} />
        <TerminalWindow title="mail — compose">
          <p className="text-accent text-xs mb-4">
            $ mail -s &quot;Hello&quot; {content.email || 'you@example.com'}
          </p>

          {content.email && (
            <p className="text-sm text-subtle mb-4">
              To: <span className="text-primary">{content.email}</span>
              {content.phone && <> · Tel: <span className="text-primary">{content.phone}</span></>}
            </p>
          )}

          <SocialIconLinks
            content={content}
            size="sm"
            className="mb-5"
            exclude={['email']}
            linkClassName="text-subtle hover:text-accent border border-border/40 hover:border-accent/50"
          />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-accent block mb-1">&gt; name:</label>
              <Input
                className="terminal-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-accent block mb-1">&gt; email:</label>
              <Input
                type="email"
                className="terminal-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs text-accent block mb-1">&gt; message:</label>
              <Textarea
                className="terminal-input min-h-[120px]"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" disabled={sending} className="font-mono">
              {sending ? '$ sending...' : '$ send'}
            </Button>
          </form>
        </TerminalWindow>
      </TerminalContainer>
    </TerminalSection>
  );
}
