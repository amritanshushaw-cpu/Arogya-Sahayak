"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, Save, Activity } from 'lucide-react';
import { calculateRisks } from '@/lib/ml/riskEngine';

export default function ScreeningForm() {
  const [formData, setFormData] = useState({
    systolicBP: '',
    diastolicBP: '',
    pulse: '',
    spO2: '',
    bloodGlucose: '',
    hemoglobin: '',
    height: '',
    weight: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vitals = {
      systolicBP: parseFloat(formData.systolicBP),
      diastolicBP: parseFloat(formData.diastolicBP),
      pulse: parseFloat(formData.pulse),
      spO2: parseFloat(formData.spO2),
      bloodGlucose: parseFloat(formData.bloodGlucose),
      hemoglobin: parseFloat(formData.hemoglobin),
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight)
    };
    
    const risks = await calculateRisks(vitals);
    console.log("Calculated ML Risks:", risks);
    alert(`Risk Assessment Complete!\nDiabetes: ${(risks.diabetes * 100).toFixed(0)}%\nHypertension: ${(risks.hypertension * 100).toFixed(0)}%\nCVD: ${(risks.cvd * 100).toFixed(0)}%\nAnemia: ${(risks.anemia * 100).toFixed(0)}%\n(See console for details)`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-danger/10 rounded-full blur-3xl pointer-events-none"></div>

      <header className="mb-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 glass-panel rounded-full flex items-center justify-center border border-slate-700 text-slate-300">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Screening</h1>
            <p className="text-xs text-slate-400">स्वास्थ्य जांच</p>
          </div>
        </div>
        <button className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/20 animate-pulse">
          <Mic size={24} />
        </button>
      </header>

      <div className="glass-panel p-4 rounded-2xl border border-slate-700/50 mb-6 relative z-10">
        <p className="text-sm text-slate-300 text-center flex items-center justify-center gap-2">
          <Mic size={16} className="text-primary" />
          Tap the mic icon to enter data using voice (Voice feature coming soon)
        </p>
      </div>

      <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
        {/* Vitals Section */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
            <Activity size={16} /> Vitals / महत्वपूर्ण
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Blood Pressure<br/>(Systolic)</label>
              <div className="relative">
                <input type="number" name="systolicBP" value={formData.systolicBP} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg focus:border-primary transition-all" placeholder="120" />
                <span className="absolute right-3 top-3.5 text-xs text-slate-500">mmHg</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Blood Pressure<br/>(Diastolic)</label>
              <div className="relative">
                <input type="number" name="diastolicBP" value={formData.diastolicBP} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg focus:border-primary transition-all" placeholder="80" />
                <span className="absolute right-3 top-3.5 text-xs text-slate-500">mmHg</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Pulse / नाड़ी</label>
              <div className="relative">
                <input type="number" name="pulse" value={formData.pulse} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg focus:border-primary transition-all" placeholder="72" />
                <span className="absolute right-3 top-3.5 text-xs text-slate-500">bpm</span>
              </div>
            </div>
             <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">SpO2 / ऑक्सीजन</label>
              <div className="relative">
                <input type="number" name="spO2" value={formData.spO2} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg focus:border-primary transition-all" placeholder="98" />
                <span className="absolute right-3 top-3.5 text-xs text-slate-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lab Section */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Blood Glucose<br/>रक्त शर्करा</label>
              <div className="relative">
                <input type="number" name="bloodGlucose" value={formData.bloodGlucose} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg focus:border-primary transition-all" placeholder="100" />
                <span className="absolute right-3 top-3.5 text-xs text-slate-500">mg/dL</span>
              </div>
            </div>
             <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Hb Level<br/>हीमोग्लोबिन</label>
              <div className="relative">
                <input type="number" name="hemoglobin" value={formData.hemoglobin} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg focus:border-primary transition-all" placeholder="12" />
                <span className="absolute right-3 top-3.5 text-xs text-slate-500">g/dL</span>
              </div>
            </div>
          </div>
        </div>

        {/* Anthropometry Section */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Height / ऊंचाई</label>
              <div className="relative">
                <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg focus:border-primary transition-all" placeholder="160" />
                <span className="absolute right-3 top-3.5 text-xs text-slate-500">cm</span>
              </div>
            </div>
             <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">Weight / वज़न</label>
              <div className="relative">
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg focus:border-primary transition-all" placeholder="60" />
                <span className="absolute right-3 top-3.5 text-xs text-slate-500">kg</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/25"
        >
          <Save size={20} />
          Submit Screening / सबमिट करें
        </button>
      </form>
    </div>
  );
}
