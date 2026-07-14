import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { type AuthGateReason } from '@/context/GuestDraftContext';
import { claimGuestDraftIfAny } from '@/lib/claimGuestDraft';
import { startOnboarding } from '@/lib/onboarding';
import { BRAND } from '@/brand/constants';
import { BrandLogo } from '@/brand/logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/Label';
import { errorMessage } from '@/lib/apiError';
import {
  LegalConsentFields,
  canSubmitWithLegalConsent,
} from '@/components/auth/LegalConsentFields';

const REASON_COPY: Record<AuthGateReason, string> = {
  import: `Create a free ${BRAND.name} account to import your resume and keep your work.`,
  publish: `Create a free ${BRAND.name} account to publish your folio at ${BRAND.domain}/{slug}.`,
  persist: `Create a free ${BRAND.name} account to save your draft — guest edits disappear on refresh.`,
};

export default function AuthGateModal({
  reason,
  onClose,
}: {
  reason: AuthGateReason;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userRegister, userLogin } = useAuth();
  const navigate = useNavigate();

  const finish = async (isNew: boolean) => {
    await claimGuestDraftIfAny();
    if (isNew) startOnboarding();
    onClose();
    navigate(
      isNew
        ? '/dashboard/onboarding'
        : reason === 'publish'
          ? '/dashboard'
          : '/dashboard/content'
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && !canSubmitWithLegalConsent(acceptPrivacy, acceptTerms)) {
      toast.error('Please accept the Privacy Policy and Terms of Service to continue.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'register') {
        await userRegister(name, email, password);
        await finish(true);
      } else {
        await userLogin(email, password);
        await finish(false);
      }
    } catch (err) {
      toast.error(errorMessage(err, mode === 'register' ? 'Registration failed' : 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  const canRegister = canSubmitWithLegalConsent(acceptPrivacy, acceptTerms);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Close" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-elevated p-6 shadow-2xl">
        <button
          type="button"
          className="absolute right-3 top-3 rounded-lg p-1.5 text-subtle hover:bg-muted hover:text-primary"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <BrandLogo size={28} className="mb-4" />
        <h2 className="text-xl font-semibold text-primary">
          {mode === 'register' ? 'Create your free account' : 'Welcome back'}
        </h2>
        <p className="mt-2 text-sm text-subtle">{REASON_COPY[reason]}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <FormField label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
            </FormField>
          )}
          <FormField label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </FormField>
          <FormField label="Password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </FormField>
          {mode === 'register' && (
            <LegalConsentFields
              acceptPrivacy={acceptPrivacy}
              acceptTerms={acceptTerms}
              onPrivacyChange={setAcceptPrivacy}
              onTermsChange={setAcceptTerms}
            />
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || (mode === 'register' && !canRegister)}
          >
            {loading ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-subtle">
          {mode === 'register' ? (
            <>
              Already have an account?{' '}
              <button type="button" className="text-accent hover:underline" onClick={() => setMode('login')}>
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button type="button" className="text-accent hover:underline" onClick={() => setMode('register')}>
                Create account
              </button>
            </>
          )}
        </p>
        <p className="mt-3 text-center text-xs text-subtle">
          Or open{' '}
          <Link
            to={`/register?claimGuest=1&next=${encodeURIComponent('/dashboard/onboarding')}`}
            className="text-accent hover:underline"
            onClick={onClose}
          >
            full register page
          </Link>
        </p>
      </div>
    </div>
  );
}
