"use client";

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Hospital, HeartPulse, Loader2, AlertCircle, Activity } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  status: string;
  lastVisit: string;
}

interface Worker {
  id: string;
  name: string;
  assignedVillage: string;
  contact: string;
  activeCases: number;
}

interface PHC {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: string;
}

export default function AdminDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [ashaWorkers, setAshaWorkers] = useState<Worker[]>([]);
  const [phcs, setPhcs] = useState<PHC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Note: Replace with actual endpoints if different
        const [patientsRes, ashaRes, phcRes] = await Promise.all([
          fetch(`${apiUrl}/api/admin/patients`).catch(() => ({ ok: false, json: () => [] })),
          fetch(`${apiUrl}/api/admin/users?role=asha`).catch(() => ({ ok: false, json: () => [] })),
          fetch(`${apiUrl}/api/admin/users?role=phc`).catch(() => ({ ok: false, json: () => [] }))
        ]);

        const [patientsData, ashaData, phcData] = await Promise.all([
          patientsRes.ok ? patientsRes.json() : [],
          ashaRes.ok ? ashaRes.json() : [],
          phcRes.ok ? phcRes.json() : []
        ]);

        // Mock data fallback for presentation if endpoints fail/return empty
        setPatients(patientsData.length ? patientsData : [
          { id: 'P01', name: 'Ramesh Kumar', age: 45, gender: 'M', status: 'Critical', lastVisit: '2023-10-12' },
          { id: 'P02', name: 'Sunita Devi', age: 32, gender: 'F', status: 'Stable', lastVisit: '2023-10-14' },
          { id: 'P03', name: 'Amit Singh', age: 58, gender: 'M', status: 'Observation', lastVisit: '2023-10-15' },
        ]);
        
        setAshaWorkers(ashaData.length ? ashaData : [
          { id: 'A01', name: 'Meena Kumari', assignedVillage: 'Rampur', contact: '+91 9876543210', activeCases: 12 },
          { id: 'A02', name: 'Lakshmi Bai', assignedVillage: 'Sitapur', contact: '+91 9876543211', activeCases: 8 },
        ]);

        setPhcs(phcData.length ? phcData : [
          { id: 'H01', name: 'Rampur PHC', location: 'District Center', capacity: 50, status: 'Active' },
          { id: 'H02', name: 'Sitapur Sub-center', location: 'North Block', capacity: 20, status: 'Overcrowded' },
        ]);

      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
              Admin Command Center
            </h1>
            <p className="text-slate-400 mt-2">Monitor global healthcare operations, workforce, and patient metrics.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span className="text-sm font-medium tracking-wide">SYSTEM ONLINE</span>
          </div>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            <p className="text-slate-400 animate-pulse">Synchronizing Data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Patients Table */}
            <section className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <HeartPulse className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold">Active Patients</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-sm">
                      <th className="pb-3 px-4 font-medium">Patient</th>
                      <th className="pb-3 px-4 font-medium">Age/Gender</th>
                      <th className="pb-3 px-4 font-medium">Status</th>
                      <th className="pb-3 px-4 font-medium">Last Visit</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-white/5">
                    {patients.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 font-medium text-slate-200">{p.name} <span className="text-xs text-slate-500 block">{p.id}</span></td>
                        <td className="py-4 px-4 text-slate-400">{p.age} / {p.gender}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            p.status === 'Critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                            p.status === 'Stable' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-400">{p.lastVisit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="space-y-6">
              {/* ASHA Workers List */}
              <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-cyan-500/20 rounded-lg">
                      <UserPlus className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-semibold">ASHA Workers</h2>
                  </div>
                  <span className="text-xs font-medium bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">{ashaWorkers.length} Active</span>
                </div>
                <div className="space-y-4">
                  {ashaWorkers.map((w) => (
                    <div key={w.id} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-cyan-500/30 transition-all">
                      <h3 className="font-medium text-slate-200">{w.name}</h3>
                      <div className="flex justify-between items-center mt-2 text-sm text-slate-400">
                        <span>{w.assignedVillage}</span>
                        <span className="flex items-center gap-1 text-cyan-400"><Users className="w-3 h-3"/> {w.activeCases} Cases</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* PHCs List */}
              <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-indigo-500/20 rounded-lg">
                    <Hospital className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h2 className="text-xl font-semibold">PHC Network</h2>
                </div>
                <div className="space-y-4">
                  {phcs.map((h) => (
                    <div key={h.id} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-slate-200">{h.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          h.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 flex justify-between">
                        <span>{h.location}</span>
                        <span>Cap: {h.capacity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
