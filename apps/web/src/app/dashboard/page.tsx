import React from 'react';
import Link from 'next/link';
import { UserPlus, Activity, Users, Settings } from 'lucide-react';

export default function Dashboard() {
  const patients = [
    { id: 1, name: 'Sita Devi', age: 45, village: 'Rampur', lastVisit: '2 days ago', risk: 'High' },
    { id: 2, name: 'Ramesh Kumar', age: 52, village: 'Rampur', lastVisit: '1 week ago', risk: 'Medium' },
    { id: 3, name: 'Geeta', age: 31, village: 'Shivpur', lastVisit: '1 month ago', risk: 'Low' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">ASHA Portal</h1>
          <p className="text-sm text-slate-400">Welcome / स्वागत है, Anjali</p>
        </div>
        <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
          <Settings size={20} className="text-slate-300" />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/dashboard/register" className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-primary/20 active:bg-slate-800 transition-colors shadow-lg shadow-primary/5">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-1">
            <UserPlus size={24} />
          </div>
          <span className="font-semibold text-sm">Add Patient<br/><span className="text-xs text-slate-400 font-normal">नया मरीज</span></span>
        </Link>
        <Link href="/screening" className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2 border border-success/20 active:bg-slate-800 transition-colors shadow-lg shadow-success/5">
          <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center text-success mb-1">
            <Activity size={24} />
          </div>
          <span className="font-semibold text-sm">Screening<br/><span className="text-xs text-slate-400 font-normal">जांच</span></span>
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4">
        <Link href="/dashboard/phc" className="glass-panel w-full p-4 rounded-xl flex items-center justify-center text-center gap-2 border border-purple-500/30 active:bg-slate-800 transition-colors shadow-lg shadow-purple-500/10">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-lg text-purple-400">PHC District Dashboard</span>
            <span className="text-xs text-slate-400">View analytics and disease trends</span>
          </div>
        </Link>
        <Link href="/teleconsult" className="glass-panel w-full p-4 rounded-xl flex items-center justify-center text-center gap-2 border border-blue-500/30 active:bg-slate-800 transition-colors shadow-lg shadow-blue-500/10">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-lg text-blue-400">Teleconsultation</span>
            <span className="text-xs text-slate-400">Connect with a doctor <span className="font-normal">(टेलीकंसल्टेशन)</span></span>
          </div>
        </Link>
      </div>

      <div className="mb-4 flex justify-between items-end">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users size={20} className="text-primary" />
          Recent Patients <span className="text-sm text-slate-400 font-normal ml-2">हाल के मरीज</span>
        </h2>
      </div>

      <div className="space-y-3">
        {patients.map(patient => (
          <div key={patient.id} className="glass-panel p-4 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-lg">{patient.name}</h3>
              <p className="text-sm text-slate-400">{patient.age} yrs • {patient.village}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-1
                ${patient.risk === 'High' ? 'bg-danger/20 text-danger border border-danger/30' : 
                  patient.risk === 'Medium' ? 'bg-warning/20 text-warning border border-warning/30' : 
                  'bg-success/20 text-success border border-success/30'}`}>
                {patient.risk} Risk
              </span>
              <p className="text-xs text-slate-500">{patient.lastVisit}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
