import { useEffect, useState } from 'react';
import { platformApi } from '@/api';
import { Card } from '@/components/ui/Card';

export default function PlatformActivityPage() {
  const [activity, setActivity] = useState<Awaited<ReturnType<typeof platformApi.getActivity>>>([]);

  useEffect(() => {
    platformApi.getActivity().then(setActivity).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Activity Log</h1>
      <Card>
        <div className="space-y-2">
          {activity.map((a, i) => (
            <div key={i} className="flex justify-between text-sm border-b border-border/50 pb-2">
              <span className="text-secondary">{a.action} · {a.entity}</span>
              <span className="text-xs text-subtle font-mono">{new Date(a.timestamp).toLocaleString()}</span>
            </div>
          ))}
          {activity.length === 0 && <p className="text-subtle text-sm">No activity yet.</p>}
        </div>
      </Card>
    </div>
  );
}
