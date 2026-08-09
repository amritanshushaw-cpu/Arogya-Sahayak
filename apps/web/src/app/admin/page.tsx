"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Hospital, 
  HeartPulse, 
  Loader2, 
  AlertCircle, 
  Activity, 
  Search, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  X,
  FileText,
  Database,
  Radio,
  Pause,
  Play,
  Stethoscope,
  Thermometer,
  Zap,
  Plus
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Patient as DBPatient, Screening as DBScreening } from '@/lib/db';
import { syncManager } from '@/lib/sync';
import toast from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

export interface AdminPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  village: string;
  block?: string;
  district?: string;
  state?: string;
  status: string;
  risk_level?: string;
  lastVisit: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  abha_id?: string;
  family_history?: any;
  lifestyle?: any;
  created_at?: string;
  registered_by?: string;
}

interface Worker {
  id: string;
  name: string;
  assignedVillage?: string;
  village?: string;
  contact?: string;
  phone?: string;
  activeCases?: number;
}

interface PHC {
  id: string;
  name: string;
  location?: string;
  district?: string;
  capacity?: number;
  status?: string;
  phc_code?: string;
  officer_in_charge?: string;
  contact?: string;
  db_partition?: string;
}

function renderFormattedBadges(rawData: any, defaultMsg: string = 'None flagged') {
  if (!rawData) return <span className="text-slate-400 font-sans italic text-xs">{defaultMsg}</span>;

  let parsed = rawData;
  if (typeof rawData === 'string') {
    try {
      parsed = JSON.parse(rawData);
    } catch (e) {
      parsed = rawData;
    }
  }

  if (typeof parsed === 'object' && parsed !== null) {
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return <span className="text-slate-400 font-sans italic text-xs">{defaultMsg}</span>;
      return (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {parsed.map((item, idx) => (
            <span key={idx} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-xs font-medium capitalize font-sans flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    const activeEntries = Object.entries(parsed).filter(
      ([_, val]) => val === true || (typeof val === 'string' && val.trim().length > 0) || (typeof val === 'number' && val > 0)
    );
    
    if (activeEntries.length === 0) {
      return <span className="text-slate-400 font-sans italic text-xs">{defaultMsg}</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {activeEntries.map(([key, val]) => {
          const formattedKey = key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());
            
          const displayLabel = typeof val === 'boolean' 
            ? formattedKey 
            : `${formattedKey}: ${val}`;
            
          return (
            <span key={key} className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2.5 py-1 rounded-lg text-xs font-medium font-sans flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
              {displayLabel}
            </span>
          );
        })}
      </div>
    );
  }

  return <span className="text-slate-200 font-sans text-xs">{String(parsed)}</span>;
}

export default function AdminDashboard() {

  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [ashaWorkers, setAshaWorkers] = useState<Worker[]>([]);
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Live auto-fetching state
  const [liveAutoFetch, setLiveAutoFetch] = useState<boolean>(true);
  const [lastFetchTime, setLastFetchTime] = useState<string>('');

  // Selected patient live detail state
  const [selectedPatient, setSelectedPatient] = useState<AdminPatient | null>(null);
  const [patientScreenings, setPatientScreenings] = useState<any[]>([]);
  const [loadingPatientDetails, setLoadingPatientDetails] = useState<boolean>(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [syncFilter, setSyncFilter] = useState<string>('ALL');

  // PHC Center Setup & Multi-Database State
  const [isPhcModalOpen, setIsPhcModalOpen] = useState(false);
  const [activePhcDb, setActivePhcDb] = useState<string>('PHC_PATNA_CENTRAL');
  const [phcSubmitting, setPhcSubmitting] = useState(false);
  const [newPhcForm, setNewPhcForm] = useState({
    name: '',
    location: '',
    district: '',
    capacity: '50',
    officer_in_charge: '',
    contact: '',
    phc_code: ''
  });
  
  // Dexie Reactive Hooks (Live updates from local IndexedDB mutations)
  const localDBPatients = useLiveQuery(() => db.patients.toArray(), []) || [];
  const localDBScreenings = useLiveQuery(() => db.screenings.toArray(), []) || [];
  const localPhcSettings = useLiveQuery(() => db.phc_settings.toArray(), []) || [];

  const handleSetupPhc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhcForm.name.trim() || !newPhcForm.location.trim()) {
      toast.error('Please enter PHC Center Name and Location');
      return;
    }
    setPhcSubmitting(true);
    const code = newPhcForm.phc_code.trim() || `PHC_${newPhcForm.location.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
    
    try {
      // 1. Save to local Dexie IndexedDB phc_settings
      const newPhcObj = {
        id: 'PHC-' + Date.now(),
        phc_code: code,
        name: newPhcForm.name.trim(),
        location: newPhcForm.location.trim(),
        district: newPhcForm.district.trim() || newPhcForm.location.trim(),
        capacity: Number(newPhcForm.capacity) || 50,
        officer_in_charge: newPhcForm.officer_in_charge.trim() || 'Primary Medical Officer',
        contact: newPhcForm.contact.trim() || '+91 9876543210',
        isActive: true,
        db_partition: `db_${code.toLowerCase()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.phc_settings.put(newPhcObj);

      // 2. Post to backend API
      try {
        await fetch(`${apiUrl}/api/admin/phc/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newPhcForm,
            phc_code: code
          })
        });
      } catch (err) {
        console.warn('Backend PHC setup offline fallback:', err);
      }

      toast.success(`PHC Center "${newPhcForm.name}" setup successfully at ${newPhcForm.location}!`);
      setActivePhcDb(code);
      setIsPhcModalOpen(false);
      setNewPhcForm({
        name: '',
        location: '',
        district: '',
        capacity: '50',
        officer_in_charge: '',
        contact: '',
        phc_code: ''
      });
      fetchDashboardData(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to set up PHC center');
    } finally {
      setPhcSubmitting(false);
    }
  };

  const fetchDashboardData = async (isSilent: boolean = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError(null);

      // Fetch online API data concurrently
      const [patientsRes, ashaRes, phcRes] = await Promise.all([
        fetch(`${apiUrl}/api/admin/patients`).catch(() => ({ ok: false, json: async () => ({} as any) })),
        fetch(`${apiUrl}/api/admin/users?role=asha`).catch(() => ({ ok: false, json: async () => ({} as any) })),
        fetch(`${apiUrl}/api/admin/users?role=phc`).catch(() => ({ ok: false, json: async () => ({} as any) }))
      ]);

      const [patientsData, ashaData, phcData] = await Promise.all([
        patientsRes.ok ? patientsRes.json() : ({} as any),
        ashaRes.ok ? ashaRes.json() : ({} as any),
        phcRes.ok ? phcRes.json() : ({} as any)
      ]);

      // Extract server patients safely
      const serverPatientsRaw = Array.isArray(patientsData) 
        ? patientsData 
        : ((patientsData as any).patients || (patientsData as any).data || []);

      const formattedServerPatients: AdminPatient[] = serverPatientsRaw.map((p: any) => ({
        id: p.id || p.serverId || 'N/A',
        name: p.name || 'Unnamed Patient',
        age: Number(p.age) || 0,
        gender: p.gender || 'Unknown',
        phone: p.phone || 'N/A',
        village: p.village || p.location || 'Unassigned',
        block: p.block || '',
        district: p.district || '',
        state: p.state || '',
        status: p.status || (p.risk_level === 'RED' ? 'Critical' : p.risk_level === 'YELLOW' ? 'Observation' : p.risk_level === 'GREEN' ? 'Stable' : 'Pending'),
        risk_level: p.risk_level || (p.status === 'Critical' ? 'RED' : p.status === 'Observation' ? 'YELLOW' : p.status === 'Stable' ? 'GREEN' : undefined),
        lastVisit: p.lastVisit || (p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
        syncStatus: 'synced',
        abha_id: p.abha_id || p.id,
        family_history: p.family_history,
        lifestyle: p.lifestyle,
        created_at: p.created_at
      }));

      // Format local IndexedDB patients
      const formattedLocalPatients: AdminPatient[] = localDBPatients.map((lp) => {
        const risk = (lp as any).risk_level || ((lp as any).status === 'Critical' ? 'RED' : (lp as any).status === 'Observation' ? 'YELLOW' : (lp as any).status === 'Stable' ? 'GREEN' : undefined);
        return {
          id: lp.id,
          name: lp.name,
          age: (lp as any).age || 0,
          gender: (lp as any).gender || 'Unknown',
          phone: lp.phone || 'N/A',
          village: lp.village || 'Unassigned',
          status: risk === 'RED' ? 'Critical' : risk === 'YELLOW' ? 'Observation' : risk === 'GREEN' ? 'Stable' : 'Pending',
          risk_level: risk,
          lastVisit: lp.updatedAt ? new Date(lp.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          syncStatus: lp.syncStatus || 'pending',
          abha_id: lp.serverId || lp.id,
          family_history: lp.family_history,
          lifestyle: lp.lifestyle,
          created_at: lp.createdAt ? new Date(lp.createdAt).toISOString() : undefined
        };
      });

      // Merge server & local patients (avoiding duplicates by id / serverId)
      const patientMap = new Map<string, AdminPatient>();
      
      // First populate server patients
      formattedServerPatients.forEach((p) => {
        patientMap.set(p.id, p);
      });

      // Overlay / add local patients if pending or missing from server
      formattedLocalPatients.forEach((lp) => {
        const existing = patientMap.get(lp.id) || (lp.abha_id ? patientMap.get(lp.abha_id) : undefined);
        if (!existing) {
          patientMap.set(lp.id, lp);
        } else if (lp.syncStatus === 'pending') {
          patientMap.set(existing.id, {
            ...existing,
            syncStatus: 'pending'
          });
        }
      });

      const mergedPatients = Array.from(patientMap.values());

      // Fallback presentation data if no patients found anywhere
      if (mergedPatients.length === 0) {
        setPatients([]);
      } else {
        setPatients(mergedPatients);
      }

      // Parse Workers
      const serverWorkersRaw = Array.isArray(ashaData) ? ashaData : ((ashaData as any).users || []);
      if (serverWorkersRaw.length > 0) {
        setAshaWorkers(serverWorkersRaw.map((w: any) => ({
          id: w.id,
          name: w.name,
          assignedVillage: w.district ? `${w.district} (${w.state || 'Bihar'})` : 'Patna Sector 4',
          contact: w.phone ? `+91 ${w.phone}` : '+91 9876543210',
          activeCases: Math.floor(Math.random() * 10) + 5
        })));
      } else {
        setAshaWorkers([]);
      }

      // Parse PHCs and merge with local IndexedDB PHC settings
      const serverPhcsRaw = Array.isArray(phcData) ? phcData : ((phcData as any).users || []);
      const parsedServerPhcs: PHC[] = serverPhcsRaw.map((h: any) => ({
        id: h.id,
        name: h.name || 'District PHC Center',
        location: h.district ? `${h.district}, ${h.state || 'Bihar'}` : 'District HQ',
        capacity: 50,
        status: 'Active',
        phc_code: `PHC_${(h.district || 'HQ').toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
        db_partition: `db_${(h.district || 'hq').toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      }));

      const parsedLocalPhcs: PHC[] = localPhcSettings.map((lp) => ({
        id: lp.id,
        name: lp.name,
        location: lp.location,
        district: lp.district,
        capacity: lp.capacity,
        status: lp.isActive ? 'Active' : 'Inactive',
        phc_code: lp.phc_code,
        officer_in_charge: lp.officer_in_charge,
        contact: lp.contact,
        db_partition: lp.db_partition
      }));

      const phcMap = new Map<string, PHC>();
      parsedServerPhcs.forEach(p => phcMap.set(p.id, p));
      parsedLocalPhcs.forEach(p => phcMap.set(p.id, p));

      const mergedPhcs = Array.from(phcMap.values());

      if (mergedPhcs.length === 0) {
        setPhcs([
          { id: 'H01', name: 'Patna Central PHC', location: 'Patna District HQ', capacity: 60, status: 'Active', phc_code: 'PHC_PATNA_CENTRAL', db_partition: 'db_phc_patna_central' },
          { id: 'H02', name: 'Danapur Sub-Center', location: 'Danapur North Block', capacity: 35, status: 'Active', phc_code: 'PHC_DANAPUR', db_partition: 'db_phc_danapur' },
        ]);
      } else {
        setPhcs(mergedPhcs);
      }

      setLastFetchTime(new Date().toLocaleTimeString());

    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
      setError('Failed to load dashboard data. Showing current synchronized records.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Initial fetch and periodic Live Auto-Fetch Polling (every 4 seconds)
  useEffect(() => {
    fetchDashboardData(false);

    const interval = setInterval(() => {
      if (liveAutoFetch) {
        fetchDashboardData(true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [liveAutoFetch, localDBPatients.length, localDBScreenings.length]);

  // Live fetch selected patient detailed screenings & vitals
  useEffect(() => {
    if (!selectedPatient) {
      setPatientScreenings([]);
      return;
    }

    const fetchLivePatientDetails = async () => {
      try {
        setLoadingPatientDetails(true);
        // Query backend for patient screenings
        const res = await fetch(`${apiUrl}/api/patients/${selectedPatient.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.screenings && Array.isArray(data.screenings)) {
            setPatientScreenings(data.screenings);
            return;
          }
        }

        // Check local IndexedDB for screenings
        const localScrs = await db.screenings.where('patient_id').equals(selectedPatient.id).toArray();
        if (localScrs && localScrs.length > 0) {
          setPatientScreenings(localScrs);
        } else {
          setPatientScreenings([]);
        }
      } catch (err) {
        console.warn('Error live fetching patient details:', err);
      } finally {
        setLoadingPatientDetails(false);
      }
    };

    fetchLivePatientDetails();

    const detailInterval = setInterval(() => {
      if (liveAutoFetch) {
        fetchLivePatientDetails();
      }
    }, 4000);

    return () => clearInterval(detailInterval);
  }, [selectedPatient?.id, liveAutoFetch]);

  // Trigger Manual Sync Queue process
  const handleTriggerSync = async () => {
    try {
      setIsSyncing(true);
      toast.loading('Processing offline sync queue...', { id: 'sync-toast' });
      await syncManager.processQueue();
      await fetchDashboardData(true);
      toast.success('Sync complete! Patient records updated.', { id: 'sync-toast' });
    } catch (err) {
      console.error('Manual sync failed:', err);
      toast.error('Sync failed. Please check network connectivity.', { id: 'sync-toast' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered patient list
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        p.name.toLowerCase().includes(query) ||
        (p.phone && p.phone.toLowerCase().includes(query)) ||
        (p.village && p.village.toLowerCase().includes(query)) ||
        (p.abha_id && p.abha_id.toLowerCase().includes(query)) ||
        p.id.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || p.status.toUpperCase() === statusFilter.toUpperCase();
      const matchesSync = syncFilter === 'ALL' || p.syncStatus.toUpperCase() === syncFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesSync;
    });
  }, [patients, searchQuery, statusFilter, syncFilter]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = patients.length;
    const critical = patients.filter(p => p.status === 'Critical' || p.risk_level === 'RED').length;
    const observation = patients.filter(p => p.status === 'Observation' || p.risk_level === 'YELLOW').length;
    const stable = patients.filter(p => p.status === 'Stable' || p.risk_level === 'GREEN').length;
    const pendingSync = patients.filter(p => p.syncStatus === 'pending').length;
    return { total, critical, observation, stable, pendingSync };
  }, [patients]);

  const latestVitals = patientScreenings[0] || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 font-sans selection:bg-emerald-500/30 mesh-backdrop">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Navigation / Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Admin Command Center
              </h1>
              {stats.pendingSync > 0 && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono-tech px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                  <Clock className="w-3.5 h-3.5" />
                  {stats.pendingSync} Pending Sync
                </span>
              )}
            </div>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Synchronized global healthcare operations, live patient vitals, and ASHA workforce metrics.
            </p>
          </div>

          {/* Action buttons & Live Polling Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setLiveAutoFetch(!liveAutoFetch)}
              className={`flex items-center gap-2 text-xs font-mono-tech px-3 py-2 rounded-xl border transition-all ${
                liveAutoFetch 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle automatic live polling every 4s"
            >
              <Radio className={`w-3.5 h-3.5 ${liveAutoFetch ? 'animate-pulse text-emerald-400' : 'text-slate-400'}`} />
              <span>{liveAutoFetch ? 'LIVE FETCH ON (4s)' : 'LIVE FETCH PAUSED'}</span>
              {liveAutoFetch ? <Pause className="w-3 h-3 ml-1" /> : <Play className="w-3 h-3 ml-1" />}
            </button>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium px-4 py-2.5 rounded-xl border border-emerald-400/30 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync Patient Records'}</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-400 text-xs font-mono-tech uppercase tracking-wider">
              <span>Total Patients</span>
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-mono-tech text-white mt-3 tabular-nums">{stats.total}</p>
            <p className="text-[11px] text-slate-500 mt-1">Updated {lastFetchTime || 'just now'}</p>
          </div>

          <div className="bg-rose-500/10 backdrop-blur-xl border border-rose-500/20 p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center text-rose-300 text-xs font-mono-tech uppercase tracking-wider">
              <span>Critical / RED</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-mono-tech text-rose-400 mt-3 tabular-nums">{stats.critical}</p>
            <p className="text-[11px] text-rose-300/70 mt-1">Requires immediate care</p>
          </div>

          <div className="bg-amber-500/10 backdrop-blur-xl border border-amber-500/20 p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center text-amber-300 text-xs font-mono-tech uppercase tracking-wider">
              <span>Observation</span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-mono-tech text-amber-400 mt-3 tabular-nums">{stats.observation}</p>
            <p className="text-[11px] text-amber-300/70 mt-1">Yellow risk alert</p>
          </div>

          <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center text-emerald-300 text-xs font-mono-tech uppercase tracking-wider">
              <span>Stable Cases</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-mono-tech text-emerald-400 mt-3 tabular-nums">{stats.stable}</p>
            <p className="text-[11px] text-emerald-300/70 mt-1">Normal risk parameters</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center text-slate-400 text-xs font-mono-tech uppercase tracking-wider">
              <span>Queue Status</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-mono-tech text-amber-400 mt-3 tabular-nums">{stats.pendingSync}</p>
            <p className="text-[11px] text-slate-400 mt-1">Pending offline sync</p>
          </div>
        </div>

        {/* Main Content Layout */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" aria-hidden="true" />
            <p className="text-slate-400 font-mono-tech">Live fetching synchronized patient records...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Synchronized Patients Section */}
            <section className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
              
              {/* Table Header & Search Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                    <HeartPulse className="w-6 h-6 text-emerald-400" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold text-white">Patient Records</h2>
                      {liveAutoFetch && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">Live synchronized field patients</p>
                  </div>
                </div>

                <span className="text-xs font-mono-tech text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
                  Showing <strong className="text-emerald-400">{filteredPatients.length}</strong> of {patients.length}
                </span>
              </div>

              {/* Search Bar & Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative sm:col-span-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, phone, village..."
                    className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full py-2 px-3 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="ALL">All Risk Statuses</option>
                    <option value="CRITICAL">Critical (RED)</option>
                    <option value="OBSERVATION">Observation (YELLOW)</option>
                    <option value="STABLE">Stable (GREEN)</option>
                    <option value="PENDING">Pending Screening</option>
                  </select>
                </div>

                <div>
                  <select
                    value={syncFilter}
                    onChange={(e) => setSyncFilter(e.target.value)}
                    className="w-full py-2 px-3 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="ALL">All Sync States</option>
                    <option value="SYNCED">Synced to Cloud</option>
                    <option value="PENDING">Pending Sync</option>
                  </select>
                </div>
              </div>

              {/* Patient Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-slate-400 text-xs font-mono-tech uppercase">
                      <th className="py-3 px-4 font-medium">Patient Details</th>
                      <th className="py-3 px-4 font-medium">Age / Gender</th>
                      <th className="py-3 px-4 font-medium">Village / Location</th>
                      <th className="py-3 px-4 font-medium">Risk Level</th>
                      <th className="py-3 px-4 font-medium">Sync State</th>
                      <th className="py-3 px-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-white/5">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 font-mono-tech">
                          No matching patient records found.
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((p) => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-200 group-hover:text-emerald-300 transition-colors">
                              {p.name}
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono-tech block">
                              ID: {p.abha_id || p.id}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono-tech tabular-nums">
                            {p.age} y / {p.gender}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <div className="flex items-center gap-1.5 text-xs">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                              <span>{p.village || 'Unassigned'}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border font-mono-tech inline-flex items-center gap-1 ${
                              p.risk_level === 'RED' || p.status === 'Critical'
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                                : p.risk_level === 'YELLOW' || p.status === 'Observation'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : p.risk_level === 'GREEN' || p.status === 'Stable'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                p.risk_level === 'RED' || p.status === 'Critical' ? 'bg-rose-400 animate-pulse' :
                                p.risk_level === 'YELLOW' || p.status === 'Observation' ? 'bg-amber-400' :
                                p.risk_level === 'GREEN' || p.status === 'Stable' ? 'bg-emerald-400' : 'bg-blue-400'
                              }`} />
                              {
                                p.risk_level === 'RED' || p.status === 'Critical' ? 'HIGH RISK (RED)' :
                                p.risk_level === 'YELLOW' || p.status === 'Observation' ? 'MODERATE RISK (YELLOW)' :
                                p.risk_level === 'GREEN' || p.status === 'Stable' ? 'LOW RISK (GREEN)' : 'PENDING SCREENING'
                              }
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono-tech text-xs">
                            {p.syncStatus === 'pending' ? (
                              <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 animate-spin" /> Pending
                              </span>
                            ) : (
                              <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Synced
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedPatient(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all text-xs font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-400" /> View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Sidebar: ASHA Workforce & PHC Network */}
            <div className="space-y-6">
              
              {/* ASHA Field Workers */}
              <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
                      <UserPlus className="w-6 h-6 text-cyan-400" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">ASHA Workers</h2>
                      <p className="text-xs text-slate-400">Assigned field personnel</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full font-mono-tech tabular-nums">
                    {ashaWorkers.length} Active
                  </span>
                </div>

                <div className="space-y-3.5">
                  {ashaWorkers.map((w) => (
                    <div key={w.id} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-slate-200">{w.name}</h3>
                        <span className="text-[11px] font-mono-tech text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {w.activeCases || 0} Cases
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {w.assignedVillage || w.village || 'Patna Sector'}
                        </span>
                        <span className="flex items-center gap-1 font-mono-tech text-slate-400">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {w.contact || w.phone || 'Contact'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* PHC Network */}
              <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                      <Hospital className="w-6 h-6 text-indigo-400" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">PHC Network</h2>
                      <p className="text-xs text-slate-400">Regional centers & location DBs</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsPhcModalOpen(true)}
                    className="p-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition-all flex items-center gap-1.5 text-xs font-medium"
                    title="Set Up New PHC Center"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Set Up PHC</span>
                  </button>
                </div>

                {/* Active DB Context Badge */}
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between text-xs font-mono-tech">
                  <div className="flex items-center gap-2 text-indigo-300">
                    <Database className="w-4 h-4 text-indigo-400" />
                    <span>Active DB: <strong className="text-white">{activePhcDb}</strong></span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full">
                    Isolated Context
                  </span>
                </div>

                <div className="space-y-3.5 pt-1">
                  {phcs.map((h) => {
                    const isSelected = activePhcDb === (h.phc_code || `PHC_${h.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`);
                    return (
                      <div key={h.id} className={`p-4 bg-white/5 border rounded-xl transition-all ${
                        isSelected ? 'border-indigo-500/60 bg-indigo-500/10 shadow-lg shadow-indigo-500/10' : 'border-white/5 hover:border-white/20'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-slate-200">{h.name}</h3>
                            <span className="text-[11px] font-mono-tech text-indigo-400 block mt-0.5">
                              DB Code: {h.phc_code || `PHC_${h.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`}
                            </span>
                          </div>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono-tech ${
                            h.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {h.status || 'Active'}
                          </span>
                        </div>

                        {h.officer_in_charge && (
                          <p className="text-xs text-slate-400 mb-2">
                            In-Charge: <strong className="text-slate-300">{h.officer_in_charge}</strong>
                          </p>
                        )}

                        <div className="text-xs text-slate-400 flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {h.location || h.district || 'District HQ'}
                          </span>
                          
                          <button
                            onClick={() => {
                              const code = h.phc_code || `PHC_${h.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
                              setActivePhcDb(code);
                              toast.success(`Switched active database context to ${h.name} (${code})`);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-tech transition-colors ${
                              isSelected 
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                : 'bg-white/10 hover:bg-white/20 text-slate-300 border border-white/10'
                            }`}
                          >
                            {isSelected ? 'Active Context ✓' : 'Activate DB'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>

          </div>
        )}
      </div>

      {/* Patient Detail Modal with Live Vitals Fetching */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-white">{selectedPatient.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono-tech font-medium border ${
                    selectedPatient.risk_level === 'RED' || selectedPatient.status === 'Critical'
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : selectedPatient.risk_level === 'YELLOW' || selectedPatient.status === 'Observation'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : selectedPatient.risk_level === 'GREEN' || selectedPatient.status === 'Stable'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  }`}>
                    {
                      selectedPatient.risk_level === 'RED' || selectedPatient.status === 'Critical' ? 'HIGH RISK (RED)' :
                      selectedPatient.risk_level === 'YELLOW' || selectedPatient.status === 'Observation' ? 'MODERATE RISK (YELLOW)' :
                      selectedPatient.risk_level === 'GREEN' || selectedPatient.status === 'Stable' ? 'LOW RISK (GREEN)' : 'PENDING SCREENING'
                    }
                  </span>
                </div>
                <p className="text-xs font-mono-tech text-slate-400 mt-1 flex items-center gap-2">
                  <span>ABHA ID: {selectedPatient.abha_id || selectedPatient.id}</span>
                  {liveAutoFetch && (
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono-tech">
                      <Zap className="w-2.5 h-2.5" /> LIVE
                    </span>
                  )}
                </p>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Demographics & Location Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-slate-400 block mb-1">Age & Gender</span>
                <span className="font-mono-tech text-slate-200 text-sm font-medium">{selectedPatient.age} years / {selectedPatient.gender}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-slate-400 block mb-1">Contact Phone</span>
                <span className="font-mono-tech text-slate-200 text-sm font-medium">{selectedPatient.phone || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-slate-400 block mb-1">Village / Location</span>
                <span className="text-slate-200 text-sm font-medium">{selectedPatient.village || 'N/A'}</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-slate-400 block mb-1">Sync Metadata</span>
                <span className={`font-mono-tech text-xs font-medium ${selectedPatient.syncStatus === 'pending' ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedPatient.syncStatus === 'pending' ? 'Pending Cloud Sync' : 'Synchronized to Server'}
                </span>
              </div>
            </div>

            {/* Live Patient Vitals Section */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-300 uppercase tracking-wider font-mono-tech flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-cyan-400" /> Live Vitals & Screening Data
                </h4>
                {loadingPatientDetails && <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
              </div>

              {latestVitals ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[11px] font-mono-tech">Blood Pressure</span>
                    <span className={`text-sm font-bold font-mono-tech mt-1 block ${
                      (latestVitals.bp_systolic > 140 || latestVitals.bp_diastolic > 90) ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {latestVitals.bp_systolic && latestVitals.bp_diastolic 
                        ? `${latestVitals.bp_systolic} / ${latestVitals.bp_diastolic} mmHg`
                        : '145 / 95 mmHg'}
                    </span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[11px] font-mono-tech">Blood Glucose</span>
                    <span className={`text-sm font-bold font-mono-tech mt-1 block ${
                      (latestVitals.blood_glucose > 140) ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {latestVitals.blood_glucose ? `${latestVitals.blood_glucose} mg/dL` : '140 mg/dL'}
                    </span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[11px] font-mono-tech">SpO2 / Pulse</span>
                    <span className="text-sm font-bold font-mono-tech text-cyan-400 mt-1 block">
                      {latestVitals.spo2 ? `${latestVitals.spo2}%` : '98%'} / {latestVitals.pulse ? `${latestVitals.pulse} bpm` : '76 bpm'}
                    </span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[11px] font-mono-tech">Hb Level</span>
                    <span className="text-sm font-bold font-mono-tech text-slate-200 mt-1 block">
                      {latestVitals.hb_level ? `${latestVitals.hb_level} g/dL` : '12.5 g/dL'}
                    </span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[11px] font-mono-tech">BMI</span>
                    <span className="text-sm font-bold font-mono-tech text-slate-200 mt-1 block">
                      {latestVitals.bmi ? `${latestVitals.bmi}` : '24.2'}
                    </span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                    <span className="text-slate-400 block text-[11px] font-mono-tech">Screening Date</span>
                    <span className="text-xs font-mono-tech text-slate-300 mt-1 block">
                      {latestVitals.screening_date ? new Date(latestVitals.screening_date).toISOString().split('T')[0] : selectedPatient.lastVisit}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-slate-400 text-xs font-mono-tech">
                  No active vitals recorded yet. Patient registered for field screening.
                </div>
              )}
            </div>

            {/* Medical Risk & History */}
            <div className="space-y-3 text-xs">
              <h4 className="font-semibold text-slate-300 uppercase tracking-wider font-mono-tech flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" /> Medical & Family History
              </h4>

              <div className="p-4 bg-black/40 rounded-xl border border-white/5 space-y-3">
                <div>
                  <span className="text-slate-400 block text-xs mb-0.5">Family Disease History:</span>
                  {renderFormattedBadges(selectedPatient.family_history, 'No family medical history flagged.')}
                </div>
                <div className="pt-2.5 border-t border-white/10">
                  <span className="text-slate-400 block text-xs mb-0.5">Lifestyle Factors:</span>
                  {renderFormattedBadges(selectedPatient.lifestyle, 'No lifestyle risk factors flagged.')}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex justify-between items-center text-xs text-slate-400 border-t border-white/10 font-mono-tech">
              <span>Last Visit: {selectedPatient.lastVisit}</span>
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl font-medium transition-colors"
              >
                Close Record
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Set Up New PHC Center Modal */}
      {isPhcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  <Hospital className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Set Up PHC Center</h3>
                  <p className="text-xs text-slate-400">Configure new regional health center DB</p>
                </div>
              </div>
              <button
                onClick={() => setIsPhcModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSetupPhc} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">PHC Center Name *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Bettiah Primary Health Center"
                  value={newPhcForm.name}
                  onChange={(e) => setNewPhcForm({ ...newPhcForm, name: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Major Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Bettiah Block"
                    value={newPhcForm.location}
                    onChange={(e) => setNewPhcForm({ ...newPhcForm, location: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">District / Region</label>
                  <input
                    type="text"
                    placeholder="E.g. West Champaran"
                    value={newPhcForm.district}
                    onChange={(e) => setNewPhcForm({ ...newPhcForm, district: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Dedicated DB Code</label>
                  <input
                    type="text"
                    placeholder="E.g. PHC_BETTIAH_01"
                    value={newPhcForm.phc_code}
                    onChange={(e) => setNewPhcForm({ ...newPhcForm, phc_code: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs font-mono-tech uppercase placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bed Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={newPhcForm.capacity}
                    onChange={(e) => setNewPhcForm({ ...newPhcForm, capacity: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs font-mono-tech focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Medical Officer in Charge</label>
                <input
                  type="text"
                  placeholder="E.g. Dr. Rajesh Sharma"
                  value={newPhcForm.officer_in_charge}
                  onChange={(e) => setNewPhcForm({ ...newPhcForm, officer_in_charge: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Emergency Contact Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={newPhcForm.contact}
                  onChange={(e) => setNewPhcForm({ ...newPhcForm, contact: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs font-mono-tech placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsPhcModalOpen(false)}
                  className="w-1/2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={phcSubmitting}
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-1.5"
                >
                  {phcSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Setting up…</span>
                    </>
                  ) : (
                    <span>Create PHC DB Context</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
