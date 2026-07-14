import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { userApi } from '@/api';
import { useAuth } from '@/context/AuthContext';
import { useUnsavedChangesOptional } from '@/context/UnsavedChangesContext';
import type { PortfolioProfile } from '@/types';

const STORAGE_KEY = 'admin-active-profile';

interface AdminProfileContextType {
  profiles: PortfolioProfile[];
  activeProfile: PortfolioProfile | null;
  setActiveProfileId: (id: string) => boolean;
  refreshProfiles: () => Promise<void>;
  loading: boolean;
}

const AdminProfileContext = createContext<AdminProfileContextType | null>(null);

export function AdminProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const unsaved = useUnsavedChangesOptional();
  const [profiles, setProfiles] = useState<PortfolioProfile[]>([]);
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY)
  );
  const [loading, setLoading] = useState(true);

  const refreshProfiles = useCallback(async () => {
    const data = await userApi.getProfiles();
    setProfiles(data);
    if (data.length > 0) {
      const stored = localStorage.getItem(STORAGE_KEY);
      const exists = data.find((p) => p._id === stored);
      if (!exists) {
        const defaultProfile = data.find((p) => p.isDefault) || data[0];
        setActiveProfileIdState(defaultProfile._id);
        localStorage.setItem(STORAGE_KEY, defaultProfile._id);
      }
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'user') {
      setProfiles([]);
      setLoading(false);
      return;
    }
    refreshProfiles()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authLoading, user, refreshProfiles]);

  const setActiveProfileId = useCallback(
    (id: string) => {
      if (id === activeProfileId) return true;
      if (unsaved && !unsaved.confirmDiscard()) return false;
      setActiveProfileIdState(id);
      localStorage.setItem(STORAGE_KEY, id);
      return true;
    },
    [activeProfileId, unsaved]
  );

  const activeProfile = profiles.find((p) => p._id === activeProfileId) ?? null;

  return (
    <AdminProfileContext.Provider
      value={{ profiles, activeProfile, setActiveProfileId, refreshProfiles, loading }}
    >
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  const ctx = useContext(AdminProfileContext);
  if (!ctx) throw new Error('useAdminProfile must be used within AdminProfileProvider');
  return ctx;
}
