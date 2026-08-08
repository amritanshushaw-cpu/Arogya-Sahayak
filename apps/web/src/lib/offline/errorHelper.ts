// errorHelper.ts
/**
 * Helper to mark a sync queue item as failed.
 * It updates the item with failure metadata without removing it, allowing retries later.
 */
import { db } from './db';

export async function markQueueItemFailed(itemId: number, errorMsg: string): Promise<void> {
  await db.syncQueue.update(itemId, {
    status: 'failed',
    failed: true,
    errorMsg,
  });
}
