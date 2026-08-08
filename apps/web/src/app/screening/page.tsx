"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, Save, Activity } from 'lucide-react';
import { calculateRisks, RiskScores } from '@/lib/ml/riskEngine';
import { RiskCard } from '@/components/RiskCard';
import { VoiceInput } from '@/components/VoiceInput';
import { ExtractedVitals } from '@/lib/ml/nerParser';
import toast, { Toaster } from 'react-hot-toast';

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

  const [assessmentResult, setAssessmentResult] = useState<{
    scores: RiskScores;
    reasons: Record<keyof RiskScores, string[]>;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleVitalsExtracted = (vitals: ExtractedVitals, transcript: string) => {
    setFormData(prev => ({
      ...prev,
      ...vitals
    }));

    const extractedKeys = Object.keys(vitals) as (keyof ExtractedVitals)[];
    if (extractedKeys.length > 0) {
      const summary = extractedKeys.map(k => `${k}: ${vitals[k]}`).join(', ');
      setToastMessage(`Extracted: ${summary}`);
    } else {
      setToastMessage(`Could not extract any vitals from speech.`);
    }

    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateReasons = (vitals: any) => {
    const reasons: Record<keyof RiskScores, string[]> = {
      diabetes: [],
      hypertension: [],
      cvd: [],
      anemia: []
    };

    if (vitals.bloodGlucose > 125) reasons.diabetes.push(`High blood glucose (${vitals.bloodGlucose} mg/dL)`);
    else if (vitals.bloodGlucose > 100) reasons.diabetes.push(`Elevated blood glucose (${vitals.bloodGlucose} mg/dL)`);

    if (vitals.systolicBP > 130 || vitals.diastolicBP > 85) {
      reasons.hypertension.push(`Elevated blood pressure (${vitals.systolicBP}/${vitals.diastolicBP} mmHg)`);
    }

    if (vitals.hemoglobin < 11.0) reasons.anemia.push(`Low hemoglobin (${vitals.hemoglobin} g/dL)`);
    else if (vitals.hemoglobin < 12.0) reasons.anemia.push(`Slightly low hemoglobin (${vitals.hemoglobin} g/dL)`);

    let bmi = 22;
    if (vitals.weight && vitals.height) {
      const heightInMeters = vitals.height / 100;
      bmi = vitals.weight / (heightInMeters * heightInMeters);
      if (bmi > 30) reasons.cvd.push(`High BMI (${bmi.toFixed(1)})`);
    }
    if (vitals.systolicBP > 140) reasons.cvd.push(`High systolic BP (${vitals.systolicBP} mmHg)`);

    return reasons;
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
    const reasons = generateReasons(vitals);
    
    setAssessmentResult({ scores: risks, reasons });

    // Check if overall risk is high and trigger toast
    const maxScore = Math.max(...Object.values(risks));
    if (maxScore > 0.7) {
      toast.error('⚠️ High Risk Detected! Alert automatically routed to nearest PHC.', {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: 'bold',
        }
      });
    }
  };

  const getOverallRiskLevel = () => {
    if (!assessmentResult) return null;
    const maxScore = Math.max(...Object.values(assessmentResult.scores));
    if (maxScore > 0.7) return { level: 'High', color: 'text-red-500' };
    if (maxScore >= 0.3) return { level: 'Medium', color: 'text-yellow-500' };
    return { level: 'Low', color: 'text-green-500' };
  };

  const overallRisk = getOverallRiskLevel();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20 relative overflow-hidden">
      <Toaster />
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-danger/10 rounded-full blur-3xl pointer-events-none"></div>

      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl border border-primary/50 text-sm max-w-sm w-[90%] text-center animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}

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
        <VoiceInput onVitalsExtracted={handleVitalsExtracted} />
      </header>

      {!assessmentResult ? (
        <>
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/50 mb-6 relative z-10">
            <p className="text-sm text-slate-300 text-center flex items-center justify-center gap-2">
              <Mic size={16} className="text-primary" />
              Tap the mic icon to enter vitals using voice
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
        </>
      ) : (
        <div className="relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 text-center">
            <h2 className="text-xl font-bold text-slate-200 mb-2">Assessment Complete</h2>
            <p className="text-slate-400 text-sm mb-4">Patient risk profile has been generated based on the provided vitals.</p>
            <div className="inline-block px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
              <span className="text-sm text-slate-400">Overall Risk Level: </span>
              <span className={`font-bold ${overallRisk?.color}`}>{overallRisk?.level}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-2">Clinical Decision Support</h3>
            <div className="grid gap-4">
              <RiskCard 
                title="Diabetes Risk" 
                score={assessmentResult.scores.diabetes} 
                reasons={assessmentResult.reasons.diabetes} 
              />
              <RiskCard 
                title="Hypertension Risk" 
                score={assessmentResult.scores.hypertension} 
                reasons={assessmentResult.reasons.hypertension} 
              />
              <RiskCard 
                title="Cardiovascular (CVD) Risk" 
                score={assessmentResult.scores.cvd} 
                reasons={assessmentResult.reasons.cvd} 
              />
              <RiskCard 
                title="Anemia Risk" 
                score={assessmentResult.scores.anemia} 
                reasons={assessmentResult.reasons.anemia} 
              />
            </div>
          </div>

          <button 
            onClick={() => setAssessmentResult(null)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-4 rounded-xl flex items-center justify-center transition-colors border border-slate-700"
          >
            New Screening
          </button>
        </div>
      )}
    </div>
  );
}
