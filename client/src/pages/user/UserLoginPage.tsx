import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { claimGuestDraftIfAny } from '@/lib/claimGuestDraft';
import { BRAND } from '@/brand/constants';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/Label';

export default function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { userLogin } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const claimGuest = params.get('claimGuest') === '1';
  const next = params.get('next') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userLogin(email, password);
      if (claimGuest) await claimGuestDraftIfAny();
      toast.success(`Welcome back to ${BRAND.name}`);
      navigate(next.startsWith('/') ? next : '/dashboard');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <h1 className="text-lg font-bold text-primary sm:text-xl">Sign in</h1>
      <p className="mt-1 text-xs text-subtle">Manage your {BRAND.name} dashboard</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
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
            autoComplete="current-password"
          />
        </FormField>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-accent hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="sm" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <p className="mt-3 text-center text-xs text-subtle">
        No account?{' '}
        <Link
          to={claimGuest ? '/register?claimGuest=1' : '/register'}
          className="text-accent hover:underline"
        >
          Create one
        </Link>
      </p>
    </AuthPageShell>
  );
}
