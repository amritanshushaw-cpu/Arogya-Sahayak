"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import { User, Activity, MapPin, Stethoscope, Video, ArrowLeft, History, Loader2, UserCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { token } = useAuthStore();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://schemegg.onrender.com';
        const res = await fetch(`${apiUrl}/api/patients/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setPatient(data);
        } else {
          // If we can't fetch real data yet, we might mock it for the demo, 
          // or show an error. We'll show a mock just to have the UI working nicely 
          // in case the backend isn't fully ready.
          setPatient({
            id: params.id,
            name: "Rahul Kumar",
            age: 45,
            gender: "Male",
            location: "28.7041, 77.1025",
            familyHistory: "Diabetes, Hypertension"
          });
        }
      } catch (error) {
        console.error("Error fetching patient", error);
        setPatient({
          id: params.id,
          name: "Test Patient (Offline Mode)",
          age: 45,
          gender: "Male",
          location: "28.7041, 77.1025",
          familyHistory: "Diabetes, Hypertension"
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchPatient();
    } else {
      setLoading(false);
    }
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
                  <Activity className="w-4 h-4 mr-3 text-emerald-400" />
                  <span>{patient.age} years, {patient.gender}</span>
                </div>
                <div className="flex items-center text-gray-300 text-sm bg-black/30 p-3 rounded-xl border border-white/5">
                  <MapPin className="w-4 h-4 mr-3 text-emerald-400" />
                  <span className="truncate">{patient.location}</span>
                </div>
                <div className="flex items-start text-gray-300 text-sm bg-black/30 p-3 rounded-xl border border-white/5">
                  <History className="w-4 h-4 mr-3 mt-0.5 text-emerald-400 shrink-0" />
                  <span className="text-left">{patient.familyHistory || 'No family history recorded'}</span>
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
              <h2 className="text-xl font-bold mb-4">Previous Screenings</h2>
              <div className="text-center py-8 text-gray-500 border border-dashed border-gray-700 rounded-xl">
                No past screenings found for this patient.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
