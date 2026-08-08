"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserPlus, Activity, Users, Settings, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { token, user } = useAuthStore();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${apiUrl}/api/patients`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setPatients(data.data || []);
        } else {
          toast.error('Failed to load patients');
        }
      } catch (error) {
        console.error(error);
        toast.error('Network error loading patients');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPatients();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 pb-20 mesh-backdrop">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">ASHA Portal</h1>
          <p className="text-sm text-slate-400">Welcome / स्वागत है, {user?.name || 'Worker'}</p>
        </div>
        <button 
          aria-label="Portal Settings"
          className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center border border-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Settings size={20} className="text-slate-300" aria-hidden="true" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/patients/new" className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-emerald-500/20 hover:bg-slate-800 transition-colors shadow-lg shadow-emerald-500/5 focus-visible:ring-2 focus-visible:ring-emerald-500">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-1">
            <UserPlus size={24} aria-hidden="true" />
          </div>
          <span className="font-semibold text-sm">New Patient<br/><span className="text-xs text-slate-400 font-normal">नया मरीज</span></span>
        </Link>
        <Link href="/dashboard/phc" className="glass-card p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-purple-500/20 hover:bg-slate-800 transition-colors shadow-lg shadow-purple-500/5 focus-visible:ring-2 focus-visible:ring-purple-500">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 mb-1">
            <Activity size={24} aria-hidden="true" />
          </div>
          <span className="font-semibold text-sm">Analytics<br/><span className="text-xs text-slate-400 font-normal">विश्लेषण</span></span>
        </Link>
      </div>

      <div className="mb-4 flex justify-between items-end">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users size={20} className="text-emerald-400" aria-hidden="true" />
          <span>Registered Patients</span>
          <span className="text-sm text-slate-400 font-normal ml-1">पंजीकृत मरीज</span>
        </h2>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-400" aria-hidden="true" /></div>
        ) : patients.length === 0 ? (
          <div className="text-center p-8 text-slate-500 border border-dashed border-slate-700 rounded-xl">
            No patients registered yet. Click "New Patient" to add one.
          </div>
        ) : (
          patients.map(patient => (
            <Link href={`/patients/${patient.id}`} key={patient.id} className="glass-card p-4 rounded-xl border border-slate-800 flex justify-between items-center hover:border-emerald-500/50 transition-colors block focus-visible:ring-2 focus-visible:ring-emerald-500">
              <div className="min-w-0 flex-1 mr-3">
                <h3 className="font-semibold text-lg text-white truncate">{patient.name}</h3>
                <p className="text-sm text-slate-400 font-mono-tech tabular-nums">{patient.age} yrs • {patient.gender}</p>
                <p className="text-xs text-slate-500 mt-1 truncate max-w-[220px]">{patient.location || patient.village}</p>
              </div>
              <div className="text-right flex flex-col items-end shrink-0">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 font-mono-tech">
                  View Profile
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
