import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/Label';
import { Card } from '@/components/ui/Card';

export default function PlatformLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { platformLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await platformLogin(email, password);
      toast.success('Platform admin access granted');
      navigate('/platform');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-6">
      <Card className="w-full max-w-md glass-panel border-brand-secondary/30">
        <h1 className="text-2xl font-bold text-primary mb-2">Platform Admin</h1>
        <p className="text-sm text-subtle mb-6">Monitor users and portfolios across the platform</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Admin Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </FormField>
          <FormField label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </FormField>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In to Platform'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
