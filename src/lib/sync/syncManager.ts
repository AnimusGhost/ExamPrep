import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { enqueueTask, getQueue, removeTask, SyncTask } from './queue';
import { useAuth } from '../firebase/auth';
import { createAttempt } from '../firebase/firestore';
import { useSettings } from '../settings';

export type SyncStatus = 'offline' | 'idle' | 'syncing' | 'error';

type SyncContextValue = {
  status: SyncStatus;
  queueAttempt: (payload: Record<string, unknown>) => Promise<void>;
  retry: () => Promise<void>;
};

const SyncContext = createContext<SyncContextValue | null>(null);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const { state } = useAuth();
  const [status, setStatus] = useState<SyncStatus>('idle');
  const { settings } = useSettings();

  const syncQueue = async () => {
    if (!state.user || !settings.cloudMode) return;
    if (!navigator.onLine) {
      setStatus('offline');
      return;
    }
    setStatus('syncing');
    try {
      const tasks = await getQueue();
      for (const task of tasks) {
        if (task.type === 'attempt') {
          await createAttempt(state.user.uid, task.payload);
        }
        await removeTask(task.id);
      }
      setStatus('idle');
    } catch (error) {
      console.error('Sync failed', error);
      setStatus('error');
    }
  };

  const queueAttempt = async (payload: Record<string, unknown>) => {
    const task: SyncTask = {
      id: `${Date.now()}-${Math.random()}`,
      type: 'attempt',
      payload,
      createdAt: Date.now()
    };
    await enqueueTask(task);
    await syncQueue();
  };

  useEffect(() => {
    if (!state.user || !settings.cloudMode) {
      setStatus('idle');
      return;
    }
    syncQueue();
  }, [state.user, settings.cloudMode]);

  useEffect(() => {
    const onOnline = () => syncQueue();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  });

  const value = useMemo(() => ({ status, queueAttempt, retry: syncQueue }), [status]);

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = () => {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return ctx;
};
