import Dexie, { Table } from 'dexie';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  village: string;
  syncStatus: 'synced' | 'pending';
}

export interface Screening {
  id: string;
  patient_id: string;
  risk_level: string;
  syncStatus: 'synced' | 'pending';
}

export interface SyncQueueItem {
  id?: number;
  action: string;
  payload: any;
  status: 'pending' | 'processing' | 'failed';
}

export class ArogyaDatabase extends Dexie {
  patients!: Table<Patient, string>;
  screenings!: Table<Screening, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('ArogyaDatabase');
    this.version(1).stores({
      patients: 'id, name, phone, village, syncStatus',
      screenings: 'id, patient_id, risk_level, syncStatus',
      syncQueue: 'id++, action, payload, status'
    });
  }
}

export const db = new ArogyaDatabase();
