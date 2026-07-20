import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { claimGuestDraftIfAny } from '@/lib/claimGuestDraft';
import { BRAND } from '@/brand/constants';
import { BrandLogo } from '@/brand/logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';
import { AppThemeToggle } from '@/components/ui/AppThemeToggle';

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
    <div className="relative min-h-screen marketing-mesh flex items-center justify-center px-6">
      <div className="absolute right-4 top-4 z-10">
        <AppThemeToggle />
      </div>
      <Card className="w-full max-w-md glass-panel">
        <BrandLogo size={28} className="mb-4" />
        <h1 className="text-2xl font-bold text-primary mb-2">Sign in</h1>
        <p className="text-sm text-subtle mb-6">Manage your {BRAND.name} dashboard</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormField>
          <FormField label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </FormField>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-accent hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <p className="text-sm text-subtle mt-6 text-center">
          No account?{' '}
          <Link to="/register" className="text-accent hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
