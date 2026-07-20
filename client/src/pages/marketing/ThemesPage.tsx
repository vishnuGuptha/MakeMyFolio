import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { publicApi } from '@/api';
import { BRAND } from '@/brand/constants';
import { createDemoGuestDraft, type GuestDraft } from '@/context/GuestDraftContext';
import { PORTFOLIO_THEME_LIST } from '@/themes/registry';
import { ThemeLiveCard } from '@/components/marketing/ThemeLiveCard';
import { Button } from '@/components/ui/Button';

/**
 * Themes gallery — every registered theme with the shared try-demo content.
 * Replaces the empty published-examples page.
 */
export default function ThemesPage() {
  const [demo, setDemo] = useState<GuestDraft>(() => createDemoGuestDraft());

  useEffect(() => {
    let cancelled = false;
    void publicApi
      .getTryDemo()
      .then((seed) => {
        if (!cancelled && seed) setDemo(seed);
      })
      .catch(() => {
        /* keep local demo seed */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const demoName = demo.content?.name?.trim() || 'Demo folio';

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl text-primary">Themes</h1>
          <p className="mt-2 text-subtle">
            Every look on {BRAND.name}, previewed with the same demo content ({demoName}). Open any
            theme in the try editor — no account needed.
          </p>
        </div>
        <Button asChild>
          <Link to="/try">
            Open try editor <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PORTFOLIO_THEME_LIST.map((theme) => (
          <ThemeLiveCard
            key={theme.id}
            themeId={theme.id}
            name={theme.name}
            description={theme.description}
            demoLabel={demoName}
            href={`/try?theme=${theme.id}`}
          />
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-border bg-elevated/30 px-6 py-8 text-center sm:px-10">
        <h2 className="font-display text-2xl text-primary">Like what you see?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-subtle">
          Jump into try mode, switch themes live, then create a free account when you&apos;re ready
          to publish.
        </p>
        <Button className="mt-5" asChild>
          <Link to="/try">
            Try without signup <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </main>
  );
}
