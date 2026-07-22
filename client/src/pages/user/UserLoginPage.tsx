import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { claimGuestDraftIfAny } from '@/lib/claimGuestDraft';
import { buildAuthPath, readCheckoutIntent } from '@/lib/planCheckout';
import { peekGuestDraft } from '@/context/GuestDraftContext';
import { BRAND } from '@/brand/constants';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { FormField } from '@/components/ui/Label';

const inputClass =
  'h-9 rounded-lg border-border/80 bg-base/50 focus-visible:ring-[#0066FF]/35';

export default function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { userLogin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const claimGuest = params.get('claimGuest') === '1';
  const next = params.get('next') || '/dashboard';
  const pendingPlan = readCheckoutIntent();
  const hasGuestDraft = typeof window !== 'undefined' && Boolean(peekGuestDraft());
  const registerHref = buildAuthPath('/register', {
    claimGuest: claimGuest || hasGuestDraft,
    next: next !== '/dashboard' ? next : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userLogin(email, password);
      await claimGuestDraftIfAny();
      toast.success(`Welcome back to ${BRAND.name}`);
      navigate(next.startsWith('/') ? next : '/dashboard');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      eyebrow="Sign in"
      panelTitle="Welcome back"
      panelBody={`Manage your ${BRAND.name} drafts, themes, and published link.`}
      highlights={[
        'Drafts and published folios in one place',
        'Switch themes anytime',
        'Share your live subdomain',
      ]}
    >
      <h1 className="font-display text-xl text-primary">Sign in</h1>
      <p className="mt-1 text-xs text-subtle">
        {claimGuest
          ? `Attach your guest draft to your account.`
          : pendingPlan
            ? `Sign in to continue checkout for ${pendingPlan.planId === 'pro' ? 'Pro' : pendingPlan.planId === 'premium' ? 'Premium' : 'Custom domain'}.`
            : `Access your ${BRAND.name} dashboard`}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
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
            autoComplete="current-password"
            placeholder="Your password"
          />
        </FormField>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-[11px] font-medium text-[#0066FF] hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          className="home-cta-primary h-9 w-full border-0 text-sm hover:bg-transparent"
          loading={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-3.5 text-center text-xs text-subtle">
        No account?{' '}
        <Link to={registerHref} className="font-medium text-[#0066FF] hover:underline">
          Create one free
        </Link>
      </p>
    </AuthPageShell>
  );
}
