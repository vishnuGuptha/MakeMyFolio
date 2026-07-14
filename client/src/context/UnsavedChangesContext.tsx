import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface UnsavedChangesContextType {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  lastSavedAt: number | null;
  markSaved: () => void;
  /** Returns false if the user cancels discarding edits */
  confirmDiscard: (message?: string) => boolean;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(null);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [isDirty, setDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const markSaved = useCallback(() => {
    setDirty(false);
    setLastSavedAt(Date.now());
  }, []);

  const confirmDiscard = useCallback(
    (message = 'You have unsaved changes. Leave without saving?') => {
      if (!isDirty) return true;
      return window.confirm(message);
    },
    [isDirty]
  );

  const value = useMemo(
    () => ({ isDirty, setDirty, lastSavedAt, markSaved, confirmDiscard }),
    [isDirty, lastSavedAt, markSaved, confirmDiscard]
  );

  return (
    <UnsavedChangesContext.Provider value={value}>{children}</UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) throw new Error('useUnsavedChanges must be used within UnsavedChangesProvider');
  return ctx;
}

export function useUnsavedChangesOptional() {
  return useContext(UnsavedChangesContext);
}
