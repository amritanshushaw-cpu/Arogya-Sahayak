// idMapper.ts
/**
 * Utility to resolve server IDs from local IDs for various entities.
 * It does NOT perform any network calls – it simply looks up the Dexie tables.
 */
import { db } from '../db';

export async function getPatientServerId(localId: string): Promise<string | null> {
  const patient = await db.patients.get(localId);
  return patient?.serverId ?? null;
}

export async function getScreeningServerId(localId: string): Promise<string | null> {
  const screening = await db.screenings.get(localId);
  return screening?.serverId ?? null;
}

export async function getAlertServerId(localId: string): Promise<string | null> {
  const alert = await db.alerts.get(localId);
  return alert?.serverId ?? null;
}

export async function setPatientServerId(localId: string, serverId: string): Promise<void> {
  await db.patients.update(localId, { serverId, syncStatus: 'synced', lastSyncTimestamp: new Date() });
}

export async function setScreeningServerId(localId: string, serverId: string): Promise<void> {
  await db.screenings.update(localId, { serverId, syncStatus: 'synced', lastSyncTimestamp: new Date() });
}

export async function setAlertServerId(localId: string, serverId: string): Promise<void> {
  await db.alerts.update(localId, { serverId, syncStatus: 'synced', lastSyncTimestamp: new Date() });
}
