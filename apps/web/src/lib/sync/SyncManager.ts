import { db, SyncQueueItem } from '../db';
import { SyncNetworkAdapter, DefaultSyncNetworkAdapter, SyncResult } from './SyncNetworkAdapter';
import { serializePatient, serializeScreening, serializeAlert } from '../offline/serializer';
import { setPatientServerId, setScreeningServerId, setAlertServerId } from '../offline/idMapper';

export class SyncManager {
  private networkAdapter: SyncNetworkAdapter;
  private isProcessing = false;

  constructor(networkAdapter?: SyncNetworkAdapter) {
    this.networkAdapter = networkAdapter || new DefaultSyncNetworkAdapter();
  }

  /**
   * Process all pending items in the offline queue.
   */
  async processQueue(): Promise<{ processedCount: number; failedCount: number }> {
    if (typeof window !== 'undefined' && !navigator.onLine) {
      return { processedCount: 0, failedCount: 0 };
    }

    if (this.isProcessing) {
      return { processedCount: 0, failedCount: 0 };
    }

    this.isProcessing = true;
    let processedCount = 0;
    let failedCount = 0;

    try {
      const pendingItems = await db.syncQueue.where('status').equals('pending').toArray();

      for (const item of pendingItems) {
        const success = await this.processItem(item);
        if (success) {
          processedCount++;
        } else {
          failedCount++;
        }
      }
    } finally {
      this.isProcessing = false;
    }

    return { processedCount, failedCount };
  }

  /**
   * Process a single queue item with proper serialization and network dispatching.
   */
  private async processItem(item: SyncQueueItem): Promise<boolean> {
    if (!item.id) return false;

    try {
      await db.syncQueue.update(item.id, { status: 'processing' });
      const action = item.action;
      const payload = item.payload;

      let result: SyncResult = { success: false, error: 'Unknown action' };

      if (action.includes('patient')) {
        const serialized = await serializePatient(payload);
        result = await this.networkAdapter.sendPatient(serialized);
        if (result.success && result.serverId) {
          await setPatientServerId(payload.id, result.serverId);
          await db.patients.update(payload.id, { syncStatus: 'synced', serverId: result.serverId });
        }
      } else if (action.includes('screening')) {
        const serialized = await serializeScreening(payload);
        result = await this.networkAdapter.sendScreening(serialized);
        if (result.success && result.serverId) {
          await setScreeningServerId(payload.id, result.serverId);
          await db.screenings.update(payload.id, { syncStatus: 'synced', serverId: result.serverId });
        }
      } else if (action.includes('alert')) {
        const serialized = await serializeAlert(payload);
        result = await this.networkAdapter.sendAlert(serialized);
        if (result.success && result.serverId) {
          await setAlertServerId(payload.id, result.serverId);
          await db.alerts.update(payload.id, { syncStatus: 'synced', serverId: result.serverId });
        }
      }

      if (result.success) {
        await db.syncQueue.delete(item.id);
        return true;
      } else {
        await db.syncQueue.update(item.id, { 
          status: 'pending', 
          failed: true, 
          errorMsg: result.error || 'Sync failed' 
        });
        return false;
      }
    } catch (error: any) {
      console.error(`SyncManager: Failed item ${item.id}`, error);
      await db.syncQueue.update(item.id, { 
        status: 'pending', 
        failed: true, 
        errorMsg: error?.message || 'Serialization or network exception' 
      });
      return false;
    }
  }

  /**
   * Enqueue a new domain record for offline synchronization.
   */
  async enqueue(action: string, payload: any): Promise<number> {
    const queueId = await db.syncQueue.add({
      action,
      payload,
      status: 'pending',
      failed: false
    });
    // Trigger background flush if online
    if (typeof window !== 'undefined' && navigator.onLine) {
      this.processQueue().catch(err => console.error('Background sync flush failed', err));
    }
    return queueId;
  }
}

export const syncManager = new SyncManager();
