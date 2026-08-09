"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import Link from 'next/link';
import { Lock, Phone, User, Loader2, HeartPulse, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocationLoading(false);
        toast.success('Location acquired!');
      },
      (error) => {
        console.error(error);
        toast.error('Failed to get location');
        setLocationLoading(false);
      }
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password, role, lat, lng }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        toast.success('Registration successful! Please sign in.');
        router.push('/auth/login');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const needsLocation = role === 'asha' || role === 'phc';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 mesh-backdrop">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <HeartPulse className="h-6 w-6 text-emerald-400" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-center mb-2">Create Account</h2>
        <p className="text-gray-400 text-center mb-8 text-sm">Join Arogya Sahayak network</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="reg-role" className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select
              id="reg-role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors appearance-none"
            >
              <option value="patient" className="bg-slate-900">Patient</option>
              <option value="asha" className="bg-slate-900">ASHA Worker</option>
              <option value="doctor" className="bg-slate-900">Doctor</option>
              <option value="phc" className="bg-slate-900">PHC Center</option>
            </select>
          </div>
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
              <input 
                id="reg-name"
                name="name"
                type="text" 
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder={
                  role === 'doctor' 
                    ? 'Dr. John Doe' 
                    : role === 'asha' 
                    ? 'Priya Devi' 
                    : role === 'phc' 
                    ? 'Patna PHC Center' 
                    : 'Ramesh Kumar'
                }
              />
            </div>
          </div>
          <div>
            <label htmlFor="reg-phone" className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
              <input 
                id="reg-phone"
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
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
              <input 
                id="reg-password"
                name="password"
                type="password" 
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          {needsLocation && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                aria-label="Acquire GPS Location"
                className="w-full bg-black/50 border border-white/10 hover:bg-white/5 text-gray-300 font-medium py-3 rounded-xl transition-colors flex justify-center items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {locationLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-400" aria-hidden="true" />
                ) : (
                  <MapPin className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                )}
                {lat && lng ? 'Location Acquired ✓' : 'Get Location'}
              </button>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)] flex justify-center items-center gap-2 mt-2 focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                <span>Registering…</span>
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-emerald-400 hover:text-emerald-300 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
