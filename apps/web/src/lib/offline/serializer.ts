/**
 * Serializer utilities that convert Dexie records into payloads suitable for backend API calls.
 * They strip out local‑only synchronization metadata and replace local foreign keys with server IDs.
 * If a required server ID is missing, a clear error is thrown so that the sync engine can retry later.
 */
import { Patient, Screening, Alert } from '../db';
import { getPatientServerId, getScreeningServerId } from './idMapper';

/**
 * Helper to drop synchronization fields from a generic record.
 */
function stripSyncMetadata<T extends Record<string, any>>(record: T): Omit<T, 'id' | 'serverId' | 'syncStatus' | 'deviceId' | 'createdAt' | 'updatedAt' | 'lastSyncTimestamp'> {
  const { id, serverId, syncStatus, deviceId, createdAt, updatedAt, lastSyncTimestamp, ...rest } = record;
  return rest as any;
}

/** Serialize a Patient record for the backend. */
export async function serializePatient(patient: Patient) {
  // Ensure the patient has been assigned a serverId only after sync; we do NOT send it.
  return stripSyncMetadata(patient);
}

/** Serialize a Screening record for the backend. */
export async function serializeScreening(screening: Screening) {
  // Resolve patient serverId
  const patientServerId = await getPatientServerId(screening.patient_id);
  if (!patientServerId) {
    throw new Error('Cannot serialize screening: patient has not been synchronized yet.');
  }
  const base = stripSyncMetadata(screening);
  return { ...base, patient_id: patientServerId };
}

/** Serialize an Alert record for the backend. */
export async function serializeAlert(alert: Alert) {
  const patientServerId = await getPatientServerId(alert.patient_id);
  const screeningServerId = await getScreeningServerId(alert.screening_id);
  if (!patientServerId) {
    throw new Error('Cannot serialize alert: patient has not been synchronized yet.');
  }
  if (!screeningServerId) {
    throw new Error('Cannot serialize alert: screening has not been synchronized yet.');
  }
  const base = stripSyncMetadata(alert);
  return { ...base, patient_id: patientServerId, screening_id: screeningServerId };
}
