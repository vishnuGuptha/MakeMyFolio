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
  import: 'Sign in to import your resume and keep edits forever.',
  publish: `Sign in to publish at ${getPortfolioUrlPlaceholder().replace('your-name', '{slug}')}.`,
  persist: 'Sign in to save this draft to your account permanently.',
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-gate-title"
        className="marketing-auth-card relative w-full max-w-[22rem] overflow-hidden rounded-2xl border border-[#0066FF]/16 bg-elevated shadow-2xl dark:border-white/10 dark:bg-elevated/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div
          className="h-1 w-full bg-gradient-to-r from-[#0066FF] via-[#3b82f6] to-[#06b6d4]"
          aria-hidden
        />

        <div className="p-5 pt-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <BrandLogo size={24} className="min-w-0" />
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-subtle transition-colors hover:bg-muted hover:text-primary"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h2 id="auth-gate-title" className="text-lg font-semibold tracking-tight text-primary">
            {mode === 'register' ? 'Create your free account' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-subtle">{REASON_COPY[reason]}</p>

          {/* Mode switch */}
          <div
            className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-muted/60 p-1 dark:bg-muted/40"
            role="tablist"
            aria-label="Account mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={cn(
                'rounded-lg px-3 py-2 text-center text-xs font-medium transition-colors',
                mode === 'register'
                  ? 'bg-elevated text-[#0066FF] shadow-sm ring-1 ring-[#0066FF]/20'
                  : 'text-secondary hover:text-primary'
              )}
              onClick={() => setMode('register')}
            >
              Create account
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={cn(
                'rounded-lg px-3 py-2 text-center text-xs font-medium transition-colors',
                mode === 'login'
                  ? 'bg-elevated text-[#0066FF] shadow-sm ring-1 ring-[#0066FF]/20'
                  : 'text-secondary hover:text-primary'
              )}
              onClick={() => setMode('login')}
            >
              Sign in
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            {mode === 'register' && (
              <FormField label="Name" className="space-y-1.5 [&_label]:text-xs">
                <Input
                  className="h-10 focus-visible:ring-[#0066FF]/35"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Your name"
                />
              </FormField>
            )}
            <FormField label="Email" className="space-y-1.5 [&_label]:text-xs">
              <Input
                className="h-10 focus-visible:ring-[#0066FF]/35"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </FormField>
            <FormField label="Password" className="space-y-1.5 [&_label]:text-xs">
              <PasswordInput
                className="h-10 focus-visible:ring-[#0066FF]/35"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                placeholder="At least 6 characters"
              />
            </FormField>

            {mode === 'register' && (
              <LegalConsentFields
                variant="plain"
                acceptPrivacy={acceptPrivacy}
                acceptTerms={acceptTerms}
                onPrivacyChange={setAcceptPrivacy}
                onTermsChange={setAcceptTerms}
              />
            )}

            <Button
              type="submit"
              className="home-cta-primary mt-1 h-10 w-full border-0 text-sm hover:bg-transparent"
              loading={loading}
              disabled={mode === 'register' && !canRegister}
            >
              {loading ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-subtle">
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
      </div>
    </div>,
    document.body
  );
}
