import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/api';
import { errorMessage } from '@/lib/apiError';
import { AuthPageShell } from '@/components/auth/AuthPageShell';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { FormField } from '@/components/ui/Label';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Missing reset token');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      toast.success('Password updated — sign in with your new password');
      navigate('/login');
    } catch (err) {
      toast.error(errorMessage(err, 'Reset failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell meshClassName="gradient-mesh">
      <h1 className="text-2xl font-bold text-primary mb-2">Set a new password</h1>
      <p className="text-sm text-subtle mb-6">Choose a password at least 6 characters long.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="New password">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label="Confirm password">
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </FormField>
        <Button type="submit" className="w-full" disabled={loading || !token}>
          {loading ? 'Saving…' : 'Update password'}
        </Button>
      </form>
      <p className="text-sm text-subtle mt-6 text-center">
        <Link to="/login" className="text-accent hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthPageShell>
  );
}
