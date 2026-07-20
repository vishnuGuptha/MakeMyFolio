import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';
import { platformApi } from '@/api';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getPublicPortfolioLabel, getPublicPortfolioUrl } from '@/lib/utils';

export default function PlatformPortfoliosPage() {
  const [profiles, setProfiles] = useState<Awaited<ReturnType<typeof platformApi.getProfiles>>>([]);

  const load = () => platformApi.getProfiles().then(setProfiles).catch(console.error);
  useEffect(() => { load(); }, []);

  const togglePublish = async (id: string, current: boolean) => {
    await platformApi.publishProfile(id, !current);
    toast.success(current ? 'Unpublished' : 'Published');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">All Portfolios</h1>
        <p className="text-sm text-subtle">Every portfolio on the platform</p>
      </div>
      <div className="grid gap-4">
        {profiles.map((p) => (
          <Card key={p._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{p.displayName}</h3>
                {p.isPublished ? <Badge variant="accent">Live</Badge> : <Badge variant="outline">Draft</Badge>}
              </div>
              <p className="text-xs font-mono text-subtle">{getPublicPortfolioLabel(p.slug)}</p>
              {p.owner && <p className="text-xs text-subtle mt-1">Owner: {p.owner.name} ({p.owner.email})</p>}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <a href={getPublicPortfolioUrl(p.slug)} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> View
                </a>
              </Button>
              <Button size="sm" variant="outline" onClick={() => togglePublish(p._id, p.isPublished)}>
                {p.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
