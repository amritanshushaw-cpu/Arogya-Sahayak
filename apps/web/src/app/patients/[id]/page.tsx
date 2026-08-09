"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import { Activity, MapPin, Stethoscope, Video, ArrowLeft, History, Loader2, UserCircle2 } from 'lucide-react';
import { db } from '@/lib/db';

function formatFamilyHistory(fh: any): string {
  if (!fh) return 'No family history recorded';
  if (typeof fh === 'string') return fh;
  if (typeof fh === 'object') {
    if (fh.note) return fh.note;
    const active = Object.entries(fh)
      .filter(([_, v]) => v === true || (typeof v === 'string' && v.trim().length > 0))
      .map(([k, v]) => (typeof v === 'boolean' ? k.replace(/_/g, ' ') : `${k.replace(/_/g, ' ')}: ${v}`));
    if (active.length > 0) {
      return active.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
    }
  }
  return 'No family history recorded';
}

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [patient, setPatient] = useState<any>(null);
  const [screenings, setScreenings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchPatientData = async () => {
      setLoading(true);
      const patientId = params.id;
      let foundPatient: any = null;
      let foundScreenings: any[] = [];

      // 1. Try local Dexie IndexedDB first (for offline or freshly created patients)
      try {
        const localPatient = await db.patients.get(patientId);
        if (localPatient) {
          foundPatient = {
            id: localPatient.id,
            name: localPatient.name,
            age: localPatient.age || 40,
            gender: localPatient.gender || 'Unspecified',
            location: localPatient.village || 'Location N/A',
            familyHistory: localPatient.family_history,
            syncStatus: localPatient.syncStatus
          };
        }

        const localScreenings = await db.screenings.where('patient_id').equals(patientId).toArray();
        if (localScreenings && localScreenings.length > 0) {
          foundScreenings = localScreenings;
        }
      } catch (err) {
        console.warn('IndexedDB patient fetch notice:', err);
      }

      // 2. Try server API fetch
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${apiUrl}/api/patients/${patientId}`, { headers });
        if (res.ok) {
          const serverData = await res.json();
          if (serverData) {
            foundPatient = {
              id: serverData.id || patientId,
              name: serverData.name || foundPatient?.name || 'Patient Profile',
              age: serverData.age || foundPatient?.age || 35,
              gender: serverData.gender || foundPatient?.gender || 'Male',
              location: serverData.village || serverData.location || serverData.district || foundPatient?.location || 'Location N/A',
              familyHistory: serverData.family_history || serverData.familyHistory || foundPatient?.familyHistory,
              abha_id: serverData.abha_id || foundPatient?.abha_id
            };
            if (serverData.screenings && Array.isArray(serverData.screenings)) {
              foundScreenings = serverData.screenings;
            }
          }
        }
      } catch (sErr) {
        console.warn('Server API patient fetch notice:', sErr);
      }

      // 3. Demo Patient Catalog fallback (for demo cards like P01..P07)
      if (!foundPatient) {
        const demoCatalog: Record<string, any> = {
          'P01': { name: 'Ramesh Yadav', age: 45, gender: 'Male', location: 'Maner Block, Bihar', familyHistory: 'Diabetes' },
          'P02': { name: 'Sunita Kumari', age: 38, gender: 'Female', location: 'Bihta Station Road, Bihar', familyHistory: 'Hypertension' },
          'P03': { name: 'Anil Paswan', age: 55, gender: 'Male', location: 'Fatuha Sector 2, Bihar', familyHistory: 'Cardiovascular Risk' },
          'P04': { name: 'Meena Devi', age: 62, gender: 'Female', location: 'Danapur North, Bihar', familyHistory: 'Diabetes, Hypertension' },
          'P05': { name: 'Sourav Roy', age: 34, gender: 'Male', location: 'Bhawanipore, Kolkata', familyHistory: 'Asthma' },
          'P06': { name: 'Amit Sharma', age: 49, gender: 'Male', location: 'Bettiah Block, Bihar', familyHistory: 'Thyroid Disorder' },
          'P07': { name: 'Maulana Amritanshu', age: 41, gender: 'Male', location: 'Patna HQ, Bihar', familyHistory: 'None' },
        };

        if (demoCatalog[patientId]) {
          foundPatient = { id: patientId, ...demoCatalog[patientId] };
        } else {
          // Dynamic fallback for any newly created or unregistered patient ID
          foundPatient = {
            id: patientId,
            name: `Patient (${patientId.slice(0, 8)})`,
            age: 'N/A',
            gender: 'Unspecified',
            location: 'Registered Patient',
            familyHistory: 'No family history recorded'
          };
        }
      }

      if (isMounted) {
        setPatient(foundPatient);
        setScreenings(foundScreenings);
        setLoading(false);
      }
    };

    fetchPatientData();

    return () => {
      isMounted = false;
    };
  }, [params.id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Patient Not Found</h2>
        <Link href="/dashboard" className="text-emerald-400 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const formattedFH = formatFamilyHistory(patient.familyHistory);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto mt-10">
        <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/50">
                <UserCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold mb-1">{patient.name}</h1>
              <div className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Patient ID: {params.id.slice(0, 8)}
              </div>
              
              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center text-gray-300 text-sm bg-black/30 p-3 rounded-xl border border-white/5">
                  <Activity className="w-4 h-4 mr-3 text-emerald-400 shrink-0" />
                  <span>{patient.age} years, {patient.gender}</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm bg-black/30 p-3 rounded-xl border border-white/5">
                  <MapPin className="w-4 h-4 mr-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{patient.location}</span>
                </div>
                <div className="flex items-start text-gray-300 text-sm bg-black/30 p-3 rounded-xl border border-white/5">
                  <History className="w-4 h-4 mr-3 mt-0.5 text-emerald-400 shrink-0" />
                  <span className="text-left">{formattedFH}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Action Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h2 className="text-2xl font-bold mb-2">Patient Actions</h2>
              <p className="text-gray-400 mb-8">Select an action below to proceed with the patient's care plan.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link
                  href={`/screening?patientId=${params.id}`}
                  className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-indigo-900/20 border border-indigo-500/30 hover:border-indigo-400/60 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(99,102,241,0.2)]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-8 h-8 text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Start Screening</h3>
                  <p className="text-indigo-200/60 text-sm text-center">
                    Run AI-powered health risk assessments locally.
                  </p>
                </Link>

                <Link
                  href={`/teleconsult?patientId=${params.id}`}
                  className="group flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-br from-emerald-900/50 to-emerald-900/20 border border-emerald-500/30 hover:border-emerald-400/60 transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(16,185,129,0.2)]"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Video className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Teleconsult</h3>
                  <p className="text-emerald-200/60 text-sm text-center">
                    Connect with a district doctor remotely.
                  </p>
                </Link>
              </div>
            </div>
            
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" />
                Previous Screenings {screenings.length > 0 ? `(${screenings.length})` : ''}
              </h2>

              {screenings.length === 0 ? (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-xl">
                  No past screenings found for this patient.
                </div>
              ) : (
                <div className="space-y-4">
                  {screenings.map((sc, idx) => {
                    const level = sc.risk_level || 'GREEN';
                    const badgeClass = level === 'RED' || level === 'RED_ALERT'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : level === 'YELLOW' || level === 'YELLOW_ALERT'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

                    let summaryText = '';
                    if (sc.risk_explanation) {
                      try {
                        const parsed = typeof sc.risk_explanation === 'string' ? JSON.parse(sc.risk_explanation) : sc.risk_explanation;
                        summaryText = parsed.ai_summary || parsed.summary || String(sc.risk_explanation);
                      } catch (e) {
                        summaryText = String(sc.risk_explanation);
                      }
                    }

                    return (
                      <div key={sc.id || idx} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${badgeClass}`}>
                            {level.replace('_ALERT', '')}
                          </span>
                          <span className="text-xs text-slate-400">
                            {sc.created_at || sc.screening_date ? new Date(sc.created_at || sc.screening_date).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>

                        {(sc.bp_systolic || sc.blood_glucose || sc.temperature || sc.pulse || sc.spo2) && (
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs text-slate-300 bg-white/5 p-2.5 rounded-lg border border-white/5 font-mono">
                            {sc.bp_systolic && <div><span className="text-slate-500">BP:</span> {sc.bp_systolic}/{sc.bp_diastolic || 80}</div>}
                            {sc.blood_glucose && <div><span className="text-slate-500">Sugar:</span> {sc.blood_glucose}</div>}
                            {sc.temperature && <div><span className="text-slate-500">Temp:</span> {sc.temperature}°F</div>}
                            {sc.pulse && <div><span className="text-slate-500">Pulse:</span> {sc.pulse}</div>}
                            {sc.spo2 && <div><span className="text-slate-500">SpO2:</span> {sc.spo2}%</div>}
                          </div>
                        )}

                        {summaryText && (
                          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                            {summaryText.replace(/[*#_`]/g, '')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
