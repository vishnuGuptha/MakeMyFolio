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
      <h1 className="text-2xl font-bold text-primary mb-2">Create your free account</h1>
      <p className="text-sm text-subtle mb-6">
        {claimGuest
          ? `We'll save your guest draft to ${BRAND.name} after signup.`
          : BRAND.tagline}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full Name">
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </FormField>
        <FormField label="Email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </FormField>
        <FormField label="Password">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </FormField>
        <LegalConsentFields
          acceptPrivacy={acceptPrivacy}
          acceptTerms={acceptTerms}
          onPrivacyChange={setAcceptPrivacy}
          onTermsChange={setAcceptTerms}
        />
        <Button type="submit" className="w-full" disabled={loading || !canSubmit}>
          {loading ? 'Creating...' : 'Create Account'}
        </Button>
      </form>
      <p className="text-sm text-subtle mt-6 text-center">
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
