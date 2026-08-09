"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mic, Save, Activity, Volume2, VolumeX } from 'lucide-react';
import { calculateRisks, RiskScores, ClinicalAssessmentResult } from '@/lib/ml/riskEngine';
import { RiskCard } from '@/components/RiskCard';
import { VoiceInput } from '@/components/VoiceInput';
import { ExtractedVitals } from '@/lib/ml/nerParser';
import toast, { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/lib/authStore';
import { UI_TRANS } from '@/lib/translations';

function ScreeningContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const router = useRouter();
  const { language } = useAuthStore();
  const t = UI_TRANS[language] || UI_TRANS['en-US'];

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

  const [assessmentResult, setAssessmentResult] = useState<ClinicalAssessmentResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const playAudio = (textToSpeak: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error(t.audioFailed || 'Audio playback is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech
    setIsPlaying(true);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language;
    utterance.rate = 0.9;
    
    // Attempt to match voice to local language for offline mode
    const availableVoices = window.speechSynthesis.getVoices();
    const targetLangCode = language.split('-')[0];
    const preferredVoice = availableVoices.find(v => v.lang.startsWith(targetLangCode) || v.lang === language);
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast.error(t.audioStopped || 'Audio playback stopped.');
    };

    window.speechSynthesis.speak(utterance);
  };

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
    
    const assessment = await calculateRisks(vitals);
    setAssessmentResult(assessment);

    // Check if overall risk is high and trigger toast
    if (assessment.overallRisk.level === 'High') {
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

  const overallRisk = assessmentResult?.overallRisk;

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
          <div className="flex justify-between items-center w-full mb-8">
            <Link href={patientId ? `/patients/${patientId}` : "/dashboard"} className="p-2 rounded-full bg-slate-900/50 hover:bg-slate-800 transition-colors border border-slate-700 text-slate-300">
              <ArrowLeft size={24} />
            </Link>
            <div className="flex-1 text-center pr-10">
              <h1 className="text-2xl font-bold text-white bg-clip-text">{t.screeningTitle || 'Health Screening'}</h1>
              <p className="text-xs text-slate-400 mt-1 font-medium">{t.screeningSub || 'स्वास्थ्य जांच'} {patientId && `| Patient ID: ${patientId.slice(0, 6)}`}</p>
            </div>
          </div>
        <VoiceInput onVitalsExtracted={handleVitalsExtracted} />
      </header>

      {!assessmentResult ? (
        <>
          <div className="glass-panel p-4 rounded-2xl border border-slate-700/50 mb-6 relative z-10">
            <p className="text-sm text-slate-300 text-center flex items-center justify-center gap-2">
              <Mic size={16} className="text-primary" />
              {t.tapMic || 'Tap the mic icon to enter vitals using voice'}
            </p>
          </div>

          <form className="space-y-4 relative z-10" onSubmit={handleSubmit}>
            {/* Vitals Section */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <h2 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                <Activity size={16} /> {t.tab2 || 'Vitals / महत्वपूर्ण'}
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-400">{t.sys}</label>
                  <div className="relative">
                    <input type="number" name="systolicBP" value={formData.systolicBP} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg focus:border-primary transition-all" placeholder="120" />
                    <span className="absolute right-3 top-3.5 text-xs text-slate-500">mmHg</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-400">{t.dia}</label>
                  <div className="relative">
                    <input type="number" name="diastolicBP" value={formData.diastolicBP} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg focus:border-primary transition-all" placeholder="80" />
                    <span className="absolute right-3 top-3.5 text-xs text-slate-500">mmHg</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label htmlFor="pulse-input" className="block text-xs font-medium text-slate-400">{t.pulse}</label>
                  <div className="relative">
                    <input id="pulse-input" type="number" name="pulse" value={formData.pulse} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg font-mono-tech focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="72" />
                    <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-mono-tech">bpm</span>
                  </div>
                </div>
                 <div className="space-y-1">
                  <label htmlFor="spo2-input" className="block text-xs font-medium text-slate-400">{t.spo2}</label>
                  <div className="relative">
                    <input id="spo2-input" type="number" name="spO2" value={formData.spO2} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg font-mono-tech focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="98" />
                    <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-mono-tech">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lab Section */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label htmlFor="glucose-input" className="block text-xs font-medium text-slate-400">{t.glucose}</label>
                  <div className="relative">
                    <input id="glucose-input" type="number" name="bloodGlucose" value={formData.bloodGlucose} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg font-mono-tech focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="100" />
                    <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-mono-tech">mg/dL</span>
                  </div>
                </div>
                 <div className="space-y-1">
                  <label htmlFor="hb-input" className="block text-xs font-medium text-slate-400">{t.hb}</label>
                  <div className="relative">
                    <input id="hb-input" type="number" name="hemoglobin" value={formData.hemoglobin} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg font-mono-tech focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="12" />
                    <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-mono-tech">g/dL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Anthropometry Section */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label htmlFor="height-input" className="block text-xs font-medium text-slate-400">{t.height}</label>
                  <div className="relative">
                    <input id="height-input" type="number" name="height" value={formData.height} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg font-mono-tech focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="160" />
                    <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-mono-tech">cm</span>
                  </div>
                </div>
                 <div className="space-y-1">
                  <label htmlFor="weight-input" className="block text-xs font-medium text-slate-400">{t.weight}</label>
                  <div className="relative">
                    <input id="weight-input" type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-3 py-3 text-lg font-mono-tech focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" placeholder="60" />
                    <span className="absolute right-3 top-3.5 text-xs text-slate-500 font-mono-tech">kg</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-500/25 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Save size={20} aria-hidden="true" />
              <span>{t.submitScreening || 'Submit Screening / सबमिट करें'}</span>
            </button>
          </form>
        </>
      ) : (
        <div className="relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/50 text-center">
            <h2 className="text-xl font-bold text-slate-200 mb-2">{t.assessmentComplete || 'Assessment Complete'}</h2>
            <p className="text-slate-400 text-sm mb-4">Risk profile has been generated based on the provided vitals {patientId && `for patient ${patientId.slice(0, 6)}`}.</p>
            <div className="inline-block px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 mb-4">
              <span className="text-sm text-slate-400">Overall Risk Level: </span>
              <span className={`font-bold ${overallRisk?.color}`}>{overallRisk?.level}</span>
            </div>
            <div>
              <button 
                onClick={() => playAudio(`${t.riskAssessment || 'Risk Level'}: ${overallRisk?.level}.`)}
                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg ${
                  isPlaying 
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30 shadow-rose-500/20' 
                    : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/30 shadow-indigo-500/20'
                }`}
              >
                {isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                <span>{isPlaying ? 'Stop Audio' : (t.listen || 'Listen to Result')}</span>
              </button>
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

          <div className="flex gap-4">
            <button 
              onClick={() => setAssessmentResult(null)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-4 rounded-xl flex items-center justify-center transition-colors border border-slate-700"
            >
              {t.newScreening || 'New Screening'}
            </button>
            {patientId && (
              <button 
                onClick={() => router.push(`/patients/${patientId}`)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-4 rounded-xl flex items-center justify-center transition-colors border border-emerald-500/50 shadow-lg shadow-emerald-500/20"
              >
                {t.backPatient || 'Back to Patient'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScreeningForm() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-emerald-500">Loading...</div>}>
      <ScreeningContent />
    </Suspense>
  );
}

