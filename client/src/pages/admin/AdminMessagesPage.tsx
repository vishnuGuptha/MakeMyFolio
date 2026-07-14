import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/api';
import { useAdminProfile } from '@/context/AdminProfileContext';
import { RequireActiveProfile } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { ContactMessage } from '@/types';

export default function AdminMessagesPage() {
  const { activeProfile } = useAdminProfile();
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const load = () => {
    if (!activeProfile) return;
    adminApi.getContactMessages(activeProfile._id).then(setMessages);
  };

  useEffect(load, [activeProfile]);

  const markRead = async (id: string) => {
    if (!activeProfile) return;
    await adminApi.updateContactMessage(activeProfile._id, id, { read: true });
    load();
    toast.success('Marked as read');
  };

  const archive = async (id: string) => {
    if (!activeProfile) return;
    await adminApi.updateContactMessage(activeProfile._id, id, { archived: true });
    load();
    toast.success('Archived');
  };

  return (
    <RequireActiveProfile>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-primary">Contact Messages</h1>
        {messages.filter((m) => !m.archived).map((msg) => (
          <Card key={msg._id}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold">{msg.name}</p>
                <p className="text-sm text-subtle">{msg.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {!msg.read && <Badge variant="accent">New</Badge>}
                <span className="text-xs text-subtle font-mono">{new Date(msg.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-secondary text-sm mb-4">{msg.message}</p>
            <div className="flex gap-2">
              {!msg.read && <Button size="sm" variant="outline" onClick={() => markRead(msg._id)}>Mark Read</Button>}
              <Button size="sm" variant="outline" onClick={() => archive(msg._id)}>Archive</Button>
            </div>
          </Card>
        ))}
        {messages.filter((m) => !m.archived).length === 0 && (
          <p className="text-subtle text-sm">No messages yet.</p>
        )}
      </div>
    </RequireActiveProfile>
  );
}
