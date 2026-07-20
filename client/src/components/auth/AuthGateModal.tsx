import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { type AuthGateReason } from '@/context/GuestDraftContext';
import { claimGuestDraftIfAny } from '@/lib/claimGuestDraft';
import { startOnboarding } from '@/lib/onboarding';
import { getPortfolioUrlPlaceholder } from '@/lib/domains';
import { BrandLogo } from '@/brand/logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { FormField } from '@/components/ui/Label';
import { errorMessage } from '@/lib/apiError';
import {
  LegalConsentFields,
  canSubmitWithLegalConsent,
} from '@/components/auth/LegalConsentFields';
import { cn } from '@/lib/utils';

const REASON_COPY: Record<AuthGateReason, string> = {
  import: `Create a free account to import your resume and keep your work.`,
  publish: `Create a free account to publish at ${getPortfolioUrlPlaceholder().replace('your-name', '{slug}')}.`,
  persist: `Create a free account to save your draft permanently.`,
};

const REASON_EYEBROW: Record<AuthGateReason, string> = {
  import: 'Import',
  publish: 'Publish',
  persist: 'Save',
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

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
        className="marketing-auth-card relative w-full max-w-sm rounded-2xl border border-[#0066FF]/14 bg-elevated p-4 shadow-2xl dark:border-white/10 dark:bg-elevated/90"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-2 top-2 rounded-md p-1 text-subtle hover:bg-muted hover:text-primary"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0066FF]">
          {REASON_EYEBROW[reason]}
        </p>
        <BrandLogo size={22} className="mb-2.5" />
        <h2 id="auth-gate-title" className="pr-7 text-base font-semibold text-primary">
          {mode === 'register' ? 'Create your free account' : 'Welcome back'}
        </h2>
        <p className="mt-1 text-xs leading-snug text-subtle">{REASON_COPY[reason]}</p>

        <div className="try-editor-device-shell mt-3 w-full">
          <button
            type="button"
            className={cn(
              'try-editor-chip flex-1 px-2.5 py-1.5 text-center text-xs',
              mode === 'register' && 'try-editor-chip-active'
            )}
            onClick={() => setMode('register')}
          >
            Create account
          </button>
          <button
            type="button"
            className={cn(
              'try-editor-chip flex-1 px-2.5 py-1.5 text-center text-xs',
              mode === 'login' && 'try-editor-chip-active'
            )}
            onClick={() => setMode('login')}
          >
            Sign in
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-3.5 space-y-2.5">
          {mode === 'register' && (
            <FormField label="Name" className="space-y-1 [&_label]:text-xs">
              <Input
                className="h-9 focus-visible:ring-[#0066FF]/35"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </FormField>
          )}
          <FormField label="Email" className="space-y-1 [&_label]:text-xs">
            <Input
              className="h-9 focus-visible:ring-[#0066FF]/35"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </FormField>
          <FormField label="Password" className="space-y-1 [&_label]:text-xs">
            <PasswordInput
              className="h-9 focus-visible:ring-[#0066FF]/35"
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
              className="space-y-1.5 px-2.5 py-2"
            />
          )}
          <Button
            type="submit"
            size="sm"
            className="home-cta-primary w-full border-0 hover:bg-transparent"
            disabled={loading || (mode === 'register' && !canRegister)}
          >
            {loading ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-3 text-center text-xs text-subtle">
          {mode === 'register' ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="font-medium text-[#0066FF] hover:underline"
                onClick={() => setMode('login')}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button
                type="button"
                className="font-medium text-[#0066FF] hover:underline"
                onClick={() => setMode('register')}
              >
                Create account
              </button>
            </>
          )}
        </p>
      </div>
    </div>,
    document.body
  );
}
