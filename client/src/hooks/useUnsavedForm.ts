import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useUnsavedChanges } from '@/context/UnsavedChangesContext';

function stableStringify(value: unknown) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Tracks dirty state against a saved baseline, wires beforeunload + unsaved context.
 * Call `commitBaseline(next)` after a successful save or initial load.
 */
export function useUnsavedForm<T>(current: T) {
  const baselineRef = useRef<string | null>(null);
  const { setDirty, markSaved, lastSavedAt } = useUnsavedChanges();

  const currentKey = useMemo(() => stableStringify(current), [current]);
  const isDirty = baselineRef.current !== null && currentKey !== baselineRef.current;

  useEffect(() => {
    setDirty(isDirty);
    return () => setDirty(false);
  }, [isDirty, setDirty]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const commitBaseline = useCallback(
    (value: T) => {
      baselineRef.current = stableStringify(value);
      markSaved();
    },
    [markSaved]
  );

  return {
    isDirty,
    lastSavedAt,
    commitBaseline,
  };
}
