import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/api';
import { errorMessage } from '@/lib/apiError';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/Label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetUrl(null);
    try {
      const res = await authApi.forgotPassword(email);
      toast.success(res.message);
      if (res.resetUrl) setResetUrl(res.resetUrl);
    } catch (err) {
      toast.error(errorMessage(err, 'Request failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell meshClassName="gradient-mesh">
      <h1 className="text-2xl font-bold text-primary mb-2">Forgot password</h1>
      <p className="text-sm text-subtle mb-6">
        Enter your email and we’ll send a reset link (or show one in local development).
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </FormField>
        <Button type="submit" className="w-full" loading={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
      {resetUrl && (
        <p className="mt-4 text-xs text-subtle break-all">
          Dev reset link:{' '}
          <a href={resetUrl} className="text-accent underline">
            {resetUrl}
          </a>
        </p>
      )}
      <p className="text-sm text-subtle mt-6 text-center">
        <Link to="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
