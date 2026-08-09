import Dexie, { Table } from 'dexie';

export interface Patient {
  // Local identifier
  id: string;
  // Server‑side identifier (null until synced)
  serverId: string | null;
  name: string;
  phone: string;
  village: string;
  // Synchronisation metadata
  syncStatus: 'synced' | 'pending' | 'failed';
  deviceId: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSyncTimestamp: Date | null;
  // Domain‑specific optional fields (kept as‑is for backward compatibility)
  family_history?: any;
  lifestyle?: any;
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

  constructor() {
    super('ArogyaDatabase');
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
      patients: 'id, serverId, deviceId, syncStatus, createdAt, updatedAt, lastSyncTimestamp',
      screenings: 'id, patient_id, serverId, deviceId, syncStatus, createdAt, updatedAt, lastSyncTimestamp',
      alerts: 'id, patient_id, screening_id, serverId, deviceId, syncStatus, createdAt, updatedAt, lastSyncTimestamp',
      syncQueue: 'id++, action, status, failed',
      phc_settings: 'id, phc_code, name, location, isActive, db_partition'
    });
  }
}

export const db = new ArogyaDatabase();
