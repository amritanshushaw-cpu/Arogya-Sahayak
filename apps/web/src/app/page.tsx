'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Stethoscope, 
  Mic, 
  Video, 
  LayoutDashboard, 
  Activity, 
  ShieldCheck, 
  WifiOff, 
  Zap, 
  ArrowRight,
  HeartPulse,
  Users,
  BrainCircuit
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 glass border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <HeartPulse className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                Arogya Sahayak
              </span>
              <span className="text-xs block text-slate-400 font-hindi">
                आरोग्य सहायक
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-300">
            <Link href="/screening" className="hover:text-indigo-400 transition-colors">
              AI Screening
            </Link>
            <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
              Dashboard
            </Link>
            <Link href="/teleconsult" className="hover:text-indigo-400 transition-colors">
              Teleconsult
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <WifiOff className="w-3.5 h-3.5" />
              Offline PWA Ready
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        {/* Hero Section */}
        <section className="text-center py-12 md:py-20 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-medium mb-8 backdrop-blur-md animate-fade-in">
            <BrainCircuit className="w-4 h-4 text-indigo-400" />
            Empowering ASHA & Rural Health Workers Across India
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            Arogya Sahayak <br />
            <span className="text-3xl sm:text-5xl font-semibold bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent font-hindi">
              (आरोग्य सहायक)
            </span>
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-indigo-200/90 mb-4">
            AI-Powered Early Disease Risk Prediction & Rural Health Access
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Delivering zero-latency, on-device AI diagnostic intelligence for frontline healthcare providers in remote and low-connectivity regions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/screening"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white font-semibold text-lg shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all duration-300 active:scale-95"
            >
              <Stethoscope className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
              Start Screening
              <ArrowRight className="w-5 h-5 text-indigo-200 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl glass-card text-slate-200 font-semibold text-lg hover:text-white hover:border-indigo-500/50 transition-all duration-300 active:scale-95"
            >
              <LayoutDashboard className="w-5 h-5 text-indigo-400" />
              Admin Dashboard
            </Link>
            
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-lg hover:bg-emerald-500/20 hover:text-white transition-all duration-300 active:scale-95"
            >
              <Users className="w-5 h-5 text-emerald-400" />
              Judge / Guest Access
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Comprehensive Rural Health Intelligence
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Built for high impact, low connectivity, and effortless field adoption.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Screening */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Risk Screening</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                On-device neural network models predict cardiovascular, diabetes, & respiratory risk profiles instantly without internet.
              </p>
              <Link href="/screening" className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-1 transition-transform">
                Launch Screener &rarr;
              </Link>
            </div>

            {/* Card 2: Voice Input */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center mb-5 group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Vernacular Voice Input</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Speech-to-text symptom intake in regional dialects to streamline rapid patient registration during field visits.
              </p>
              <Link href="/screening" className="inline-flex items-center text-xs font-semibold text-violet-400 hover:text-violet-300 group-hover:translate-x-1 transition-transform">
                Voice Assistant &rarr;
              </Link>
            </div>

            {/* Card 3: Teleconsult */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Teleconsultation</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Connect rural field workers directly with district hospital doctors via low-bandwidth video & emergency messaging.
              </p>
              <Link href="/teleconsult" className="inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 group-hover:translate-x-1 transition-transform">
                Connect Doctor &rarr;
              </Link>
            </div>

            {/* Card 4: Dashboard */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-5 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Admin Dashboard</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Real-time epidemiological heatmaps, village health statistics, risk distribution analytics, and field sync status.
              </p>
              <Link href="/dashboard" className="inline-flex items-center text-xs font-semibold text-amber-400 hover:text-amber-300 group-hover:translate-x-1 transition-transform">
                View Analytics &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="mt-20 glass p-8 rounded-3xl border border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 text-indigo-400 mb-3">
                <WifiOff className="w-6 h-6" />
              </div>
              <div className="text-2xl font-extrabold text-white">100% Offline</div>
              <div className="text-xs text-slate-400 mt-1">ONNX Model + Dexie DB</div>
            </div>

            <div className="p-4">
              <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 text-emerald-400 mb-3">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-2xl font-extrabold text-white">&lt; 50ms</div>
              <div className="text-xs text-slate-400 mt-1">Real-time AI Inference</div>
            </div>

            <div className="p-4">
              <div className="inline-flex p-3 rounded-xl bg-violet-500/10 text-violet-400 mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-2xl font-extrabold text-white">HIPAA / ABDM</div>
              <div className="text-xs text-slate-400 mt-1">Encrypted Local Storage</div>
            </div>

            <div className="p-4">
              <div className="inline-flex p-3 rounded-xl bg-amber-500/10 text-amber-400 mb-3">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-2xl font-extrabold text-white">ASHA Ready</div>
              <div className="text-xs text-slate-400 mt-1">Multi-lingual Interface</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 glass py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            Arogya Sahayak — Rural Healthcare AI PWA Scaffold (IEMH4-HC-01)
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <Link href="/screening" className="hover:text-indigo-400">Screening</Link>
            <Link href="/dashboard" className="hover:text-indigo-400">Dashboard</Link>
            <Link href="/teleconsult" className="hover:text-indigo-400">Teleconsult</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
