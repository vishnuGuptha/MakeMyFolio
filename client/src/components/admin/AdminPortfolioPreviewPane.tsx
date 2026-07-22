import { useCallback, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { getPreviewPortfolioPath } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type AdminPortfolioPreviewPaneProps = {
  profileId: string;
  /** Bump after save to remount the iframe with fresh server data. */
  refreshKey: number | string;
  /** Form has unsaved edits — preview still shows last save. */
  isDirty?: boolean;
  className?: string;
};

/**
 * Side-by-side CMS preview: authenticated `/preview/:id` iframe.
 * Reflects last saved portfolio state (refresh after save).
 */
export function AdminPortfolioPreviewPane({
  profileId,
  refreshKey,
  isDirty = false,
  className,
}: AdminPortfolioPreviewPaneProps) {
  const [tick, setTick] = useState(0);
  const src = getPreviewPortfolioPath(profileId);

  const reload = useCallback(() => {
    setTick((n) => n + 1);
  }, []);

  return (
    <div
      className={cn(
        'flex min-h-[22rem] flex-col overflow-hidden rounded-xl border border-[#0066FF]/15 bg-elevated shadow-sm',
        className
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-[#0066FF]/10 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0066FF]/80">
            Preview
          </p>
          <p className="truncate text-[11px] text-subtle">
            {isDirty ? 'Save to update this view' : 'Last saved version'}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 shrink-0 p-0"
          onClick={reload}
          aria-label="Refresh preview"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="outline" className="h-8 shrink-0 px-2" asChild>
          <a href={src} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:ml-1">Open</span>
          </a>
        </Button>
      </div>
      <iframe
        key={`${profileId}-${refreshKey}-${tick}`}
        title="Portfolio preview"
        src={src}
        className="min-h-0 w-full flex-1 border-0 bg-white dark:bg-zinc-950"
      />
    </div>
  );
}
