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
import { FormField } from '@/components/ui/Label';
import {
  LegalConsentFields,
  canSubmitWithLegalConsent,
} from '@/components/auth/LegalConsentFields';

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
    <AuthPageShell>
      <h1 className="text-lg font-bold text-primary sm:text-xl">Create your free account</h1>
      <p className="mt-1 text-xs text-subtle">
        {claimGuest
          ? `We'll save your guest draft to ${BRAND.name} after signup.`
          : BRAND.shortTagline}
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
        <FormField label="Full Name" className="space-y-1">
          <Input
            className="h-9"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </FormField>
        <FormField label="Email" className="space-y-1">
          <Input
            className="h-9"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </FormField>
        <FormField label="Password" className="space-y-1">
          <Input
            className="h-9"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </FormField>
        <LegalConsentFields
          acceptPrivacy={acceptPrivacy}
          acceptTerms={acceptTerms}
          onPrivacyChange={setAcceptPrivacy}
          onTermsChange={setAcceptTerms}
          className="space-y-1.5 px-2.5 py-2"
        />
        <Button type="submit" size="sm" className="w-full" disabled={loading || !canSubmit}>
          {loading ? 'Creating...' : 'Create Account'}
        </Button>
      </form>
      <p className="mt-3 text-center text-xs text-subtle">
        Already have an account?{' '}
        <Link
          to={claimGuest ? '/login?claimGuest=1' : '/login'}
          className="text-accent hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
