import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

/** How long the idle “saved” confirmation stays visible */
const SAVED_FLASH_MS = 4000;

function formatSavedAt(ts: number | null, now: number) {
  if (!ts) return null;
  const seconds = Math.round((now - ts) / 1000);
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
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!lastSavedAt || isDirty) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [lastSavedAt, isDirty]);

  const savedLabel = formatSavedAt(lastSavedAt, now);
  const showSavedFlash =
    !isDirty &&
    !!lastSavedAt &&
    now - lastSavedAt < SAVED_FLASH_MS &&
    !!savedLabel;

  if (!isDirty && !showSavedFlash) return null;

  if (!isDirty) {
    return (
      <p
        className={cn(
          'mb-3 text-xs text-subtle transition-opacity',
          className
        )}
        role="status"
        aria-live="polite"
      >
        {savedLabel}
      </p>
    );
  }

  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-elevated/95 px-4 py-3 shadow-sm backdrop-blur',
        className
      )}
    >
      <p className="text-sm text-primary">You have unsaved changes</p>
      <Button size="sm" onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save now'}
      </Button>
    </div>
  );
}
