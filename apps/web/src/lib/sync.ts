import { syncManager } from './sync/SyncManager';

export { syncManager } from './sync/SyncManager';
export type { SyncNetworkAdapter, SyncResult } from './sync/SyncNetworkAdapter';

export const processSyncQueue = async () => {
  return syncManager.processQueue();
};

export const initSyncEngine = () => {
  if (typeof window === 'undefined') return;

  const handleOnline = () => {
    console.log('App is online. Delegating to SyncManager queue processing...');
    syncManager.processQueue();
  };

  window.addEventListener('online', handleOnline);

  // Initial check
  if (navigator.onLine) {
    syncManager.processQueue();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
};
