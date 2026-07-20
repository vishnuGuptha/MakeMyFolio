import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { startOnboarding } from '@/lib/onboarding';
import { claimGuestDraftIfAny } from '@/lib/claimGuestDraft';
import { BRAND } from '@/brand/constants';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { FormField } from '@/components/ui/Label';
import {
  LegalConsentFields,
  canSubmitWithLegalConsent,
} from '@/components/auth/LegalConsentFields';

const inputClass =
  'h-9 rounded-lg border-border/80 bg-base/50 focus-visible:ring-[#0066FF]/35';

export default function UserRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userRegister } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const claimGuest = params.get('claimGuest') === '1';
  const next = params.get('next') || '/dashboard/onboarding';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitWithLegalConsent(acceptPrivacy, acceptTerms)) {
      toast.error('Please accept the Privacy Policy and Terms of Service to continue.');
      return;
    }
    setLoading(true);
    try {
      await userRegister(name, email, password);
      if (claimGuest) await claimGuestDraftIfAny();
      startOnboarding();
      toast.success(`Welcome to ${BRAND.name}! Let’s finish setup.`);
      navigate(next.startsWith('/') ? next : '/dashboard/onboarding');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = canSubmitWithLegalConsent(acceptPrivacy, acceptTerms);

  return (
    <AuthPageShell
      eyebrow="Get started"
      panelTitle="Create your free account"
      panelBody={
        claimGuest
          ? `We’ll save your guest draft so you can publish when ready.`
          : 'Start free. Publish your live portfolio link in minutes.'
      }
      highlights={['No credit card to start', 'Keep drafts after signup', 'Your own subdomain URL']}
    >
      <h1 className="font-display text-xl text-primary">Create account</h1>
      <p className="mt-1 text-xs text-subtle">
        {claimGuest ? 'Save your guest draft permanently.' : BRAND.shortTagline}
      </p>

      <form onSubmit={handleSubmit} className="mt-3.5 space-y-2">
        <FormField label="Full name" className="space-y-1">
          <Input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Alex Rivera"
          />
        </FormField>
        <FormField label="Email" className="space-y-1">
          <Input
            className={inputClass}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@email.com"
          />
        </FormField>
        <FormField label="Password" className="space-y-1">
          <PasswordInput
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />
        </FormField>
        <LegalConsentFields
          acceptPrivacy={acceptPrivacy}
          acceptTerms={acceptTerms}
          onPrivacyChange={setAcceptPrivacy}
          onTermsChange={setAcceptTerms}
          className="!space-y-1 !rounded-lg !border-border/60 !bg-base/30 !px-2.5 !py-1.5"
        />
        <Button
          type="submit"
          className="home-cta-primary h-9 w-full border-0 text-sm hover:bg-transparent"
          disabled={loading || !canSubmit}
        >
          {loading ? 'Creating...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-3 text-center text-xs text-subtle">
        Already have an account?{' '}
        <Link
          to={claimGuest ? '/login?claimGuest=1' : '/login'}
          className="font-medium text-[#0066FF] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
