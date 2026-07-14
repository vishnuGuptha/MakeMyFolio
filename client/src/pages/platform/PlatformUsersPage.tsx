import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink, Trash2 } from 'lucide-react';
import { platformApi } from '@/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function PlatformUsersPage() {
  const [users, setUsers] = useState<Awaited<ReturnType<typeof platformApi.getUsers>>>([]);

  const load = () => platformApi.getUsers().then(setUsers).catch(console.error);
  useEffect(() => { load(); }, []);

  const removeUser = async (id: string, name: string) => {
    if (!confirm(`Delete user ${name} and their portfolios?`)) return;
    await platformApi.deleteUser(id);
    toast.success('User deleted');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Users</h1>
        <p className="text-sm text-subtle">Everyone who signed up and created portfolios</p>
      </div>
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user._id} className="glass-card">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-primary">{user.name}</h3>
                <p className="text-sm text-subtle">{user.email}</p>
                <p className="text-xs text-subtle font-mono mt-1">
                  Joined {new Date(user.createdAt).toLocaleDateString()} · {user.portfolios.length} portfolio(s)
                </p>
                <div className="mt-3 space-y-2">
                  {user.portfolios.map((p) => (
                    <div key={p._id} className="flex items-center gap-2 text-sm">
                      <a href={`/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1">
                        {p.displayName} <ExternalLink className="h-3 w-3" />
                      </a>
                      <span className="font-mono text-xs text-subtle">/{p.slug}</span>
                      {p.isPublished ? <Badge variant="accent">Live</Badge> : <Badge variant="outline">Draft</Badge>}
                    </div>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="danger" onClick={() => removeUser(user._id, user.name)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
        {users.length === 0 && <p className="text-subtle text-sm">No users yet.</p>}
      </div>
    </div>
  );
}
