'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useAppAuth } from './AuthProvider';
import {
  syncAll,
  triggerDebouncedPush,
  subscribeSyncStatus,
  getLastSyncTime,
  type SyncStatus,
} from '@/lib/sync';
import { STORAGE_SYNC_EVENT } from '@/lib/storage';

export interface SyncContextValue {
  status: SyncStatus;
  lastSyncTime: number | null;
  syncNow: () => Promise<void>;
}

const DefaultSyncContext: SyncContextValue = {
  status: 'idle',
  lastSyncTime: null,
  syncNow: async () => {},
};

const SyncContext = createContext<SyncContextValue>(DefaultSyncContext);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, getToken } = useAppAuth();
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(getLastSyncTime());

  // Subscribe to status updates from sync engine
  useEffect(() => {
    return subscribeSyncStatus((newStatus) => {
      setStatus(newStatus);
      setLastSyncTime(getLastSyncTime());
    });
  }, []);

  const handleSyncNow = useCallback(async () => {
    if (!isSignedIn) return;
    await syncAll(getToken);
  }, [isSignedIn, getToken]);

  // Initial sync & network/storage listeners when signed in
  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    // 1. Initial full sync on sign-in
    syncAll(getToken);

    // 2. Debounced push on local mutations
    const onStorageChanged = () => {
      triggerDebouncedPush(getToken, 2000);
    };

    // 3. Online/offline transitions
    const onOnline = () => {
      syncAll(getToken);
    };

    window.addEventListener(STORAGE_SYNC_EVENT, onStorageChanged);
    window.addEventListener('online', onOnline);

    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, onStorageChanged);
      window.removeEventListener('online', onOnline);
    };
  }, [isSignedIn, getToken]);

  return (
    <SyncContext.Provider
      value={{
        status,
        lastSyncTime,
        syncNow: handleSyncNow,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync(): SyncContextValue {
  return useContext(SyncContext);
}
