import { db } from './db';

export const processSyncQueue = async () => {
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return;
  }

  const pendingItems = await db.syncQueue.where('status').equals('pending').toArray();

  for (const item of pendingItems) {
    try {
      // Mark as processing
      await db.syncQueue.update(item.id!, { status: 'processing' });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Synced item ${item.id} with action ${item.action}`, item.payload);

      // Update syncStatus in respective tables based on action
      if (item.action.startsWith('create_patient') || item.action.startsWith('update_patient')) {
         await db.patients.update(item.payload.id, { syncStatus: 'synced' });
      } else if (item.action.startsWith('create_screening') || item.action.startsWith('update_screening')) {
         await db.screenings.update(item.payload.id, { syncStatus: 'synced' });
      }

      // Remove from queue after successful sync
      await db.syncQueue.delete(item.id!);
    } catch (error) {
      console.error(`Failed to sync item ${item.id}`, error);
      // Revert status to pending on failure
      await db.syncQueue.update(item.id!, { status: 'pending' });
    }
  }
};

export const initSyncEngine = () => {
  if (typeof window === 'undefined') return;

  const handleOnline = () => {
    console.log('App is online. Processing sync queue...');
    processSyncQueue();
  };

  window.addEventListener('online', handleOnline);

  // Initial check
  if (navigator.onLine) {
    processSyncQueue();
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
};
