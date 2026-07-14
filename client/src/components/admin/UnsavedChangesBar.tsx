import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

function formatSavedAt(ts: number | null) {
  if (!ts) return null;
  const seconds = Math.round((Date.now() - ts) / 1000);
  if (seconds < 10) return 'Saved just now';
  if (seconds < 60) return `Saved ${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Saved ${minutes}m ago`;
  return `Saved at ${new Date(ts).toLocaleTimeString()}`;
}

export function UnsavedChangesBar({
  isDirty,
  saving,
  lastSavedAt,
  onSave,
  className,
}: {
  isDirty: boolean;
  saving: boolean;
  lastSavedAt: number | null;
  onSave: () => void;
  className?: string;
}) {
  const savedLabel = formatSavedAt(lastSavedAt);
  if (!isDirty && !savedLabel) return null;

  return (
    <div
      className={cn(
        'sticky top-0 z-20 -mx-1 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-elevated/95 px-4 py-3 shadow-lg backdrop-blur',
        isDirty ? 'border-accent/40' : 'border-border',
        className
      )}
    >
      <p className={cn('text-sm', isDirty ? 'text-primary' : 'text-subtle')}>
        {isDirty ? 'You have unsaved changes' : savedLabel}
      </p>
      {isDirty && (
        <Button size="sm" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save now'}
        </Button>
      )}
    </div>
  );
}
