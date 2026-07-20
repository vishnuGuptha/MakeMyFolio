import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '@/api';
import { BRAND } from '@/brand/constants';
import { getPublicPortfolioLabel, getPublicPortfolioUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { PortfolioProfile } from '@/types';

export default function ExamplesPage() {
  const [profiles, setProfiles] = useState<PortfolioProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .getProfiles()
      .then((list) => setProfiles(list.filter((p) => p.isPublished)))
      .catch(() => setProfiles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl text-primary">Examples</h1>
      <p className="mt-2 max-w-xl text-subtle">
        Published portfolios hosted on {BRAND.name}. Open any to see a real theme in the wild.
      </p>

      {loading && <p className="mt-10 text-sm text-subtle">Loading…</p>}

      {!loading && profiles.length === 0 && (
        <div className="mt-10 rounded-xl border border-border bg-elevated/40 p-8 text-center">
          <p className="text-subtle">No published folios yet.</p>
          <Button className="mt-4" asChild>
            <Link to="/try">Build yours</Link>
          </Button>
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <a
            key={p._id}
            href={getPublicPortfolioUrl(p.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-border bg-elevated/40 p-5 transition-colors hover:border-accent/40"
          >
            <p className="font-semibold text-primary">{p.displayName}</p>
            <p className="mt-1 font-mono text-xs text-subtle">
              {getPublicPortfolioLabel(p.slug)}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
