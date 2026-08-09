import Dexie, { Table } from 'dexie';
import { findNearestPHCCenter, NearestPHCResult } from './phcRouting';

export interface Patient {
  // Local identifier
  id: string;
  // Server‑side identifier (null until synced)
  serverId: string | null;
  name: string;
  phone: string;
  village: string;
  lat?: number;
  lng?: number;
  assigned_phc_id?: string;
  assigned_phc_code?: string;
  assigned_phc_name?: string;
  distance_km?: number;
  // Synchronisation metadata
  syncStatus: 'synced' | 'pending' | 'failed';
  deviceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSyncTimestamp: Date | null;
  // Domain‑specific optional fields (kept as‑is for backward compatibility)
  family_history?: any;
  lifestyle?: any;
  age?: number | string;
  gender?: string;
}

export interface Screening {
  id: string;
  patient_id: string; // local patient id
  risk_level: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  serverId: string | null;
  deviceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSyncTimestamp: Date | null;
  // Optional payload fields
  symptoms?: any;
  risk_explanation?: any;
}

export interface Alert {
  id: string;
  patient_id: string;
  screening_id: string;
  type: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  serverId: string | null;
  deviceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSyncTimestamp: Date | null;
}

export interface SyncQueueItem {
  id?: number;
  action: string; // e.g. 'create_patient', 'update_screening'
  payload: any;
  // Queue processing status
  status: 'pending' | 'processing' | 'failed';
  // Failure tracking
  failed?: boolean;
  errorMsg?: string;
}

export interface PHCSetting {
  id: string;
  phc_code: string;
  name: string;
  location: string;
  district?: string;
  capacity: number;
  officer_in_charge?: string;
  contact?: string;
  isActive: boolean;
  db_partition: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ArogyaDatabase extends Dexie {
  patients!: Table<Patient, string>;
  alerts!: Table<Alert, string>;
  screenings!: Table<Screening, string>;
  syncQueue!: Table<SyncQueueItem, number>;
  phc_settings!: Table<PHCSetting, string>;

  constructor(dbName: string = 'ArogyaDatabase') {
    super(dbName);
    this.version(1).stores({
      // Initial schema – only core fields
      patients: 'id, name, phone, village, syncStatus',
      screenings: 'id, patient_id, risk_level, syncStatus',
      syncQueue: 'id++, action, payload, status'
    });

    // Version 2 – add alerts table
    this.version(2).stores({
      alerts: 'id, patient_id, screening_id, type, syncStatus'
    });

    // Version 3 – add full synchronization metadata and additional indexes
    this.version(3).stores({
      patients: 'id, serverId, deviceId, syncStatus, createdAt, updatedAt, lastSyncTimestamp',
      screenings: 'id, patient_id, serverId, deviceId, syncStatus, createdAt, updatedAt, lastSyncTimestamp',
      alerts: 'id, patient_id, screening_id, serverId, deviceId, syncStatus, createdAt, updatedAt, lastSyncTimestamp',
      syncQueue: 'id++, action, status, failed'
    });

    // Version 4 – add phc_settings table for distinct multi-location PHC center databases
    this.version(4).stores({
      patients: 'id, serverId, deviceId, syncStatus, createdAt, updatedAt, lastSyncTimestamp, assigned_phc_code',
      screenings: 'id, patient_id, serverId, deviceId, syncStatus, createdAt, updatedAt, lastSyncTimestamp',
      alerts: 'id, patient_id, screening_id, serverId, deviceId, syncStatus, createdAt, updatedAt, lastSyncTimestamp',
      syncQueue: 'id++, action, status, failed',
      phc_settings: 'id, phc_code, name, location, isActive, db_partition'
    });
  }
}

// Global database instance cache for multi-location PHC databases
const phcDbInstances: Map<string, ArogyaDatabase> = new Map();

/**
 * Creates or retrieves a dedicated IndexedDB database instance for a specific PHC Location
 * @param phcCode PHC location identifier (e.g. 'PHC_PATNA_CENTRAL', 'PHC_BETTIAH_01')
 */
export function getPHCDatabase(phcCode: string = 'PATNA_CENTRAL'): ArogyaDatabase {
  const cleanCode = phcCode.toUpperCase().replace(/[^A-Z0-9]/g, '_');
  const dbName = `ArogyaDB_${cleanCode}`;

  if (!phcDbInstances.has(dbName)) {
    console.log(`[IndexedDB Manager] Creating dedicated IndexedDB instance: "${dbName}"`);
    const newDb = new ArogyaDatabase(dbName);
    phcDbInstances.set(dbName, newDb);
  }

  return phcDbInstances.get(dbName)!;
}

/**
 * Automatically routes and saves a patient record exclusively to their Nearest Available PHC Center's Database
 */
export async function routePatientToNearestPHCDatabase(
  patient: Partial<Patient> & { id: string; name: string },
  lat?: number | null,
  lng?: number | null,
  villageName?: string | null
): Promise<{ patient: Patient; routing: NearestPHCResult }> {
  const routing = findNearestPHCCenter(lat, lng, villageName || patient.village);
  const nearestPhc = routing.nearestPHC;
  const now = new Date();

  const enrichedPatient: Patient = {
    id: patient.id,
    serverId: patient.serverId || null,
    name: patient.name,
    phone: patient.phone || '',
    village: patient.village || 'Unassigned',
    lat: lat || patient.lat,
    lng: lng || patient.lng,
    assigned_phc_id: nearestPhc.id,
    assigned_phc_code: nearestPhc.phc_code,
    assigned_phc_name: nearestPhc.name,
    distance_km: routing.distanceKm,
    syncStatus: patient.syncStatus || 'pending',
    deviceId: patient.deviceId || null,
    createdAt: patient.createdAt || now,
    updatedAt: patient.updatedAt || now,
    lastSyncTimestamp: patient.lastSyncTimestamp || null,
    family_history: patient.family_history || null,
    lifestyle: patient.lifestyle || null,
    age: patient.age,
    gender: patient.gender
  };

  // Save to system DB
  await db.patients.put(enrichedPatient);

  // Save to the NEAREST PHC Center's dedicated IndexedDB instance
  const phcDb = getPHCDatabase(nearestPhc.phc_code);
  await phcDb.open();
  await phcDb.patients.put(enrichedPatient);

  console.log(`[Proximity Router] Routed patient "${patient.name}" to nearest PHC database: "${nearestPhc.name}" (${nearestPhc.phc_code}) - ${routing.distanceKm} km away`);

  return { patient: enrichedPatient, routing };
}

// Default system database instance
export const db = new ArogyaDatabase('ArogyaDatabase');
