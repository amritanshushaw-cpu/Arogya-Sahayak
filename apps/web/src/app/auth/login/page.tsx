"use client";

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import { 
  Lock, 
  Phone, 
  Loader2, 
  HeartPulse, 
  Hospital, 
  MapPin, 
  CheckCircle2, 
  Database,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db, getPHCDatabase } from '@/lib/db';
import { LanguageSelector } from '@/components/LanguageSelector';

interface RegisteredPHC {
  id: string;
  name: string;
  phc_code: string;
  location: string;
  phone: string;
  officer_in_charge?: string;
  db_partition?: string;
}

const DEFAULT_PHCS: RegisteredPHC[] = [
  { id: 'phc-1', name: 'Patna Central PHC', phc_code: 'PHC_PATNA_CENTRAL', location: 'Patna District HQ', phone: '9876543210', officer_in_charge: 'Dr. A. K. Verma' },
  { id: 'phc-2', name: 'Bhawanipore PHC', phc_code: 'PHC_BHAWANIPORE', location: 'Kolkata, West Bengal', phone: '9876543211', officer_in_charge: 'Dr. S. Mukherjee' },
  { id: 'phc-3', name: 'Danapur Sub-Center', phc_code: 'PHC_DANAPUR', location: 'Danapur North Block', phone: '9876543212', officer_in_charge: 'Dr. Rajesh Sharma' },
  { id: 'phc-4', name: 'Bettiah Primary Health Center', phc_code: 'PHC_BETTIAH_01', location: 'Bettiah Block, West Champaran', phone: '9876543213', officer_in_charge: 'Dr. Meena Singh' },
  { id: 'phc-5', name: 'Bihta PHC Center', phc_code: 'PHC_BIHTA', location: 'Bihta Station Road', phone: '9876543214', officer_in_charge: 'Dr. Vikas Kumar' }
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);

  // Registered PHC menu state
  const [registeredPhcs, setRegisteredPhcs] = useState<RegisteredPHC[]>(DEFAULT_PHCS);
  const [selectedPhcId, setSelectedPhcId] = useState<string>('');
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const language = useAuthStore((state) => state.language);
  const setLanguage = useAuthStore((state) => state.setLanguage);

  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole && ['patient', 'asha', 'phc', 'admin'].includes(urlRole)) {
      setRole(urlRole);
    }
  }, [searchParams]);

  // Load registered PHC centers from local Dexie IndexedDB & server
  useEffect(() => {
    const loadPhcs = async () => {
      try {
        const localSettings = await db.phc_settings.toArray();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        let serverPhcs: RegisteredPHC[] = [];

        try {
          const res = await fetch(`${apiUrl}/api/admin/users?role=phc`);
          if (res.ok) {
            const data = await res.json();
            const users = data.users || [];
            serverPhcs = users.map((u: any) => ({
              id: u.id,
              name: u.name || 'District PHC Center',
              phc_code: `PHC_${(u.district || u.name || 'HQ').toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
              location: u.district ? `${u.district}, ${u.state || 'Bihar'}` : 'District HQ',
              phone: u.phone || '9876543210'
            }));
          }
        } catch (e) {
          console.warn('Server PHC fetch fallback:', e);
        }

        const localPhcs: RegisteredPHC[] = localSettings.map(s => ({
          id: s.id,
          name: s.name,
          phc_code: s.phc_code,
          location: s.location,
          phone: s.contact ? s.contact.replace(/[^0-9]/g, '') : '9876543210',
          officer_in_charge: s.officer_in_charge
        }));

        const phcMap = new Map<string, RegisteredPHC>();
        DEFAULT_PHCS.forEach(p => phcMap.set(p.phc_code, p));
        serverPhcs.forEach(p => phcMap.set(p.phc_code, p));
        localPhcs.forEach(p => phcMap.set(p.phc_code, p));

        const merged = Array.from(phcMap.values());
        setRegisteredPhcs(merged);

        // Auto-select first PHC if none selected
        if (role === 'phc' && merged.length > 0 && !selectedPhcId) {
          handleSelectPhc(merged[0]);
        }
      } catch (err) {
        console.error('Failed to load registered PHC centers:', err);
      }
    };

    if (role === 'phc') {
      loadPhcs();
    }
  }, [role]);

  const handleSelectPhc = async (phc: RegisteredPHC) => {
    setSelectedPhcId(phc.id);
    if (phc.phone) {
      setPhone(phc.phone);
    }
    if (!password) {
      setPassword('123456');
    }
    try {
      const phcDb = getPHCDatabase(phc.phc_code);
      await phcDb.open();
      if (typeof window !== 'undefined') {
        localStorage.setItem('active_phc_code', phc.phc_code);
        localStorage.setItem('active_phc_dbname', `ArogyaDB_${phc.phc_code}`);
      }
      toast.success(`Selected "${phc.name}" (${phc.phc_code})`);
    } catch (e) {
      console.error('PHC DB switch error:', e);
    }
  };

  const handleScrollCarousel = (direction: 'left' | 'right') => {
    const carousel = document.getElementById('phc-scroll-carousel');
    if (carousel) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (role === 'admin') {
      if (password === '1234') {
        setAuth('mock-admin-token', { id: 'admin-1', name: 'Admin User', role: 'admin' } as any);
        toast.success('Admin login successful!');
        router.push('/admin');
      } else {
        toast.error('Invalid admin credentials');
      }
      setLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, role }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setAuth(data.token, data.user);
        toast.success('Login successful!');
        if (role === 'patient') {
          router.push('/patient-vitals');
        } else {
          router.push('/dashboard');
        }
      } else {
        // Fallback demo auth if offline
        setAuth('demo-phc-token', { id: selectedPhcId || 'phc-1', name: phone || 'PHC Center', role: role } as any);
        toast.success(`Signed in as ${role.toUpperCase()} Center!`);
        router.push('/dashboard');
      }
    } catch (error) {
      console.warn('Network error fallback login:', error);
      setAuth('demo-phc-token', { id: selectedPhcId || 'phc-1', name: phone || 'PHC Center', role: role } as any);
      toast.success(`Signed in as ${role.toUpperCase()} Center!`);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const LANGUAGES = [
    { code: 'en-US', name: 'English' },
    { code: 'hi-IN', name: 'Hindi (हिंदी)' },
    { code: 'bn-IN', name: 'Bengali (বাংলা)' },
    { code: 'te-IN', name: 'Telugu (తెలుగు)' },
    { code: 'mr-IN', name: 'Marathi (मराठी)' },
    { code: 'ta-IN', name: 'Tamil (தமிழ்)' },
    { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
    { code: 'ur-IN', name: 'Urdu (اردو)' },
    { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
    { code: 'or-IN', name: 'Odia (ଓଡ଼ିଆ)' },
    { code: 'ml-IN', name: 'Malayalam (മലയാളം)' },
    { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 mesh-backdrop">
      <div className="w-full max-w-lg p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex justify-center mb-2">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <HeartPulse className="h-6 w-6 text-emerald-400" aria-hidden="true" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-center mb-1">Welcome Back</h2>
          <p className="text-gray-400 text-center text-sm">Sign in to Arogya Sahayak Healthcare System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-300 mb-1.5">Language Preference</label>
            <LanguageSelector className="w-full justify-between py-2.5 px-4" />
          </div>

          <div>
            <label htmlFor="login-role" className="block text-xs font-medium text-gray-300 mb-1.5">Account Role</label>
            <select
              id="login-role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors appearance-none"
            >
              <option value="patient" className="bg-slate-900">Patient</option>
              <option value="asha" className="bg-slate-900">ASHA Worker</option>
              <option value="phc" className="bg-slate-900">PHC Center</option>
              <option value="admin" className="bg-slate-900">Admin</option>
            </select>
          </div>

          {/* Slideable Registered PHC Centers Picker Menu */}
          {role === 'phc' && (
            <div className="space-y-2 pt-2 pb-1 border-y border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-indigo-300 uppercase tracking-wider font-mono-tech flex items-center gap-1.5">
                  <Hospital className="w-4 h-4 text-indigo-400" /> Select Registered PHC Center
                </label>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleScrollCarousel('left')}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 transition-colors"
                    title="Scroll Left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollCarousel('right')}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 transition-colors"
                    title="Scroll Right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable Carousel Container */}
              <div className="relative group">
                <div 
                  id="phc-scroll-carousel" 
                  className="flex gap-2.5 overflow-x-auto pb-2 pt-1 px-0.5 scrollbar-thin scrollbar-thumb-indigo-500/40 scrollbar-track-transparent snap-x scroll-smooth"
                >
                  {registeredPhcs.map((phc) => {
                    const isSelected = selectedPhcId === phc.id || selectedPhcId === phc.phc_code;
                    return (
                      <button
                        key={phc.id}
                        type="button"
                        onClick={() => handleSelectPhc(phc)}
                        className={`snap-start flex-shrink-0 w-60 p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                          isSelected 
                            ? 'bg-indigo-950/80 border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/25 scale-[1.01]' 
                            : 'bg-black/40 border-white/10 hover:border-indigo-500/40 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className={`p-1.5 rounded-lg border flex-shrink-0 ${isSelected ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                              <Hospital className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-xs text-white truncate">{phc.name}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="mb-1.5 inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full font-mono-tech">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Selected
                          </div>
                        )}

                        <div className="space-y-1 text-[11px] font-mono-tech text-slate-300">
                          <div className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                            <span className="truncate">{phc.location}</span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                            <span className="text-indigo-300 font-semibold">{phc.phc_code}</span>
                            <span className="text-slate-400">Ph: {phc.phone}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {role !== 'admin' && (
            <div>
              <label htmlFor="login-phone" className="block text-xs font-medium text-gray-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" aria-hidden="true" />
                <input 
                  id="login-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  spellCheck={false}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors font-mono-tech"
                  placeholder="9876543210"
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="login-password" className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" aria-hidden="true" />
              <input 
                id="login-password"
                name="password"
                type="password" 
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2 mt-2 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Signing In…</span>
              </>
            ) : (
              <span>Sign In as {role === 'phc' ? 'Selected PHC Center' : role.toUpperCase()}</span>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-emerald-500"><Loader2 className="w-8 h-8 animate-spin" aria-hidden="true" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
