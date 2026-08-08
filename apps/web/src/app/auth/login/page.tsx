"use client";

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import { Lock, Phone, Loader2, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  
  const setAuth = useAuthStore((state) => state.setAuth);
  const language = useAuthStore((state) => state.language);
  const setLanguage = useAuthStore((state) => state.setLanguage);

  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole && ['patient', 'asha', 'phc', 'admin'].includes(urlRole)) {
      setRole(urlRole);
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (role === 'admin') {
      if (password === '1234') {
        // Mock admin auth
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
        toast.error(data.error || data.message || 'Login failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error. Please try again.');
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
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <HeartPulse className="h-6 w-6 text-emerald-400" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-center mb-2">Welcome Back</h2>
        <p className="text-gray-400 text-center mb-8 text-sm">Sign in to Arogya Sahayak</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="mb-6 flex flex-col">
            <label htmlFor="login-lang" className="text-sm font-medium text-gray-300 mb-2">Language Preference</label>
            <select
              id="login-lang"
              name="language"
              value={language || 'en-US'}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            >
              {LANGUAGES.map(l => (
                <option key={l.code} value={l.code} className="bg-slate-900">{l.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="login-role" className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select
              id="login-role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors appearance-none"
            >
              <option value="patient" className="bg-slate-900">Patient</option>
              <option value="asha" className="bg-slate-900">ASHA Worker</option>
              <option value="phc" className="bg-slate-900">PHC Center</option>
              <option value="admin" className="bg-slate-900">Admin</option>
            </select>
          </div>

          {role !== 'admin' && (
            <div>
              <label htmlFor="login-phone" className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
                <input 
                  id="login-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  spellCheck={false}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors font-mono-tech"
                  placeholder="9876543210"
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
              <input 
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2 mt-2 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                <span>Signing In…</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-emerald-400 hover:text-emerald-300 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1">
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
