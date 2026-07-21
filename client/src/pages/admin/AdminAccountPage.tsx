import { useState } from 'react';
import { toast } from 'sonner';
import { authApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { errorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';

export default function AdminAccountPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not change password'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-primary">Change password</h1>
        <p className="mt-1 text-sm text-subtle">Signed in as {user?.email}</p>
      </div>

      <Card>
        <h2 className="font-semibold text-primary mb-4">Change password</h2>
        <form onSubmit={handleChange} className="space-y-4">
          <FormField label="Current password">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </FormField>
          <FormField label="New password">
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirm new password">
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </FormField>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Update password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
