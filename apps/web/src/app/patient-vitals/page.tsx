"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { Mic, MicOff, Globe, Activity, Send, Loader2, User, HeartPulse, FileText, MapPin, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

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

export default function PatientDashboard() {
  const { token, user, language, setLanguage } = useAuthStore();
  const [step, setStep] = useState<'info' | 'vitals' | 'detection'>('info');

  // Info State
  const [infoForm, setInfoForm] = useState({
    age: '',
    gender: 'Male',
    village: '',
    familyHistory: ''
  });
  const [infoSaved, setInfoSaved] = useState(false);
  const [locating, setLocating] = useState(false);

  // Vitals State
  const [vitalsForm, setVitalsForm] = useState({
    bp_systolic: '',
    bp_diastolic: '',
    blood_glucose: '',
    temperature: '',
    pulse: '',
    spo2: '',
    weight: '',
    height: ''
  });
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAutofilling, setIsAutofilling] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Detection State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };
        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }
  }, []);

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setInfoForm({ ...infoForm, village: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
        toast.success('Location fetched successfully');
        setLocating(false);
      },
      (error) => {
        console.error(error);
        toast.error('Unable to retrieve your location');
        setLocating(false);
      }
    );
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoForm.age || !infoForm.village) {
      toast.error('Please fill in age and village/location');
      return;
    }

    try {
      const payload = {
        name: user?.name || 'Patient',
        age: Number(infoForm.age),
        gender: infoForm.gender,
        village: infoForm.village,
        family_history: infoForm.familyHistory
      };

      const res = await fetch(`${apiUrl}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Information saved successfully!');
        setInfoSaved(true);
        setStep('vitals');
      } else {
        toast.error('Failed to save information');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error');
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in this browser.');
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const autofillVitals = async () => {
    if (!transcript.trim()) {
      toast.error('Please record audio first before autofilling.');
      return;
    }
    
    setIsAutofilling(true);
    try {
      const prompt = `Extract vitals from this text and return ONLY a valid JSON object. Keys must be exactly: bp_systolic, bp_diastolic, blood_glucose, temperature, pulse, spo2, weight, height. If a value is missing, set it to an empty string "". Text: "${transcript}"`;
      
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      if (response.ok) {
        const data = await response.json();
        const textReply = data.reply || data.response || data.answer || "{}";
        const jsonMatch = textReply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setVitalsForm(prev => ({ ...prev, ...parsed }));
          toast.success('Vitals autofilled successfully!');
        } else {
          toast.error('Could not extract vitals perfectly.');
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Autofill failed. Check network or type manually.');
    } finally {
      setIsAutofilling(false);
    }
  };

  const submitVitals = () => {
    if (!transcript.trim() && !vitalsForm.temperature && !vitalsForm.bp_systolic) {
      toast.error('Please record your symptoms or enter your vitals');
      return;
    }
    setStep('detection');
    analyzeData();
  };

  const analyzeData = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const langName = LANGUAGES.find(l => l.code === language)?.name || 'English';
      const vitalsString = JSON.stringify(vitalsForm);
      const prompt = `Act as a medical risk analyzer. Patient Age: ${infoForm.age}, Gender: ${infoForm.gender}, Family History: ${infoForm.familyHistory}. Patient Vitals entered: ${vitalsString}. Patient Symptoms Audio Transcript: "${transcript}". Provide a detailed disease detection analysis and risk assessment. YOU MUST OUTPUT ENTIRELY IN THIS LANGUAGE: ${langName}.`;

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data.reply || data.response || data.answer || "Analysis complete.");
      } else {
        throw new Error('LLM Failed');
      }
    } catch (error) {
      console.error('Online LLM failed, using offline math model', error);
      
      // Fallback Inbuilt Mathematical Model
      let riskScore = 0;
      let conditions = [];
      const lowerTranscript = transcript.toLowerCase();
      
      if (lowerTranscript.includes('sugar') || lowerTranscript.includes('diabetes') || Number(vitalsForm.blood_glucose) > 140) {
        riskScore += 30;
        conditions.push('Diabetes Risk');
      }
      if (lowerTranscript.includes('pressure') || lowerTranscript.includes('bp') || Number(vitalsForm.bp_systolic) > 140) {
        riskScore += 30;
        conditions.push('Hypertension Risk');
      }
      if (lowerTranscript.includes('fever') || lowerTranscript.includes('temperature') || Number(vitalsForm.temperature) > 99.5) {
        riskScore += 20;
        conditions.push('Fever / Infection');
      }
      
      let level = 'LOW';
      if (riskScore > 50) level = 'HIGH';
      else if (riskScore > 20) level = 'MODERATE';

      setAnalysisResult(`[OFFLINE MODE]\n\nBased on basic parameters and vitals:\nRisk Level: ${level}\nPotential flags: ${conditions.join(', ') || 'None detected'}\n\nPlease consult a doctor for accurate diagnosis.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVitalsForm({ ...vitalsForm, [e.target.name]: e.target.value });
  };

  const speakResult = () => {
    if (!analysisResult) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(analysisResult);
      utterance.lang = language;
      
      // Try to find a voice that matches the selected language
      const voices = window.speechSynthesis.getVoices();
      const matchVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
      if (matchVoice) {
        utterance.voice = matchVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech is not supported in this browser.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex bg-white/5 backdrop-blur-md rounded-2xl p-2 mb-6 border border-white/10 gap-2">
          <button 
            onClick={() => setStep('info')}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${step === 'info' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <User className="w-4 h-4" /> Patient Info
          </button>
          <button 
            onClick={() => infoSaved && setStep('vitals')}
            disabled={!infoSaved}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${step === 'vitals' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'} ${!infoSaved ? 'opacity-50 cursor-not-allowed' : 'hover:text-white hover:bg-white/5'}`}
          >
            <HeartPulse className="w-4 h-4" /> Vitals
          </button>
          <button 
            onClick={() => (infoSaved && (transcript || vitalsForm.temperature)) && setStep('detection')}
            disabled={!infoSaved || (!transcript && !vitalsForm.temperature)}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all ${step === 'detection' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'} ${(!infoSaved || (!transcript && !vitalsForm.temperature)) ? 'opacity-50 cursor-not-allowed' : 'hover:text-white hover:bg-white/5'}`}
          >
            <Activity className="w-4 h-4" /> Detection
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          {/* STEP 1: INFO */}
          {step === 'info' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-400" /> Patient Details & History
                </h2>
                <p className="text-slate-400">Please provide your details before recording vitals.</p>
              </header>

              <form onSubmit={handleInfoSubmit} className="space-y-4 max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Age</label>
                    <input 
                      type="number" 
                      required
                      value={infoForm.age}
                      onChange={e => setInfoForm({...infoForm, age: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Gender</label>
                    <select 
                      value={infoForm.gender}
                      onChange={e => setInfoForm({...infoForm, gender: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Village / Location</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required
                      value={infoForm.village}
                      onChange={e => setInfoForm({...infoForm, village: e.target.value})}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter location or use auto-fetch"
                    />
                    <button 
                      type="button" 
                      onClick={handleGetLocation}
                      disabled={locating}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                      {locating ? 'Locating...' : 'Get Location'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">Family Disease History</label>
                  <textarea 
                    rows={3}
                    placeholder="E.g. Diabetes, Hypertension in parents..."
                    value={infoForm.familyHistory}
                    onChange={e => setInfoForm({...infoForm, familyHistory: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors mt-6">
                  Save Information & Continue
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: VITALS */}
          {step === 'vitals' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full">
              <header className="mb-6 flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <HeartPulse className="w-6 h-6 text-pink-400" /> Patient Vitals
                  </h2>
                  <p className="text-slate-400">Record symptoms via audio to autofill parameters, or type manually.</p>
                </div>
                
                <div className="w-64">
                  <label className="text-sm text-slate-400 flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4" /> Audio Language
                  </label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-sm text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* Audio Recording & Transcript */}
                <div className="flex flex-col gap-4">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[200px] relative">
                    <textarea 
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Speak to record your symptoms, or type here..."
                      className="w-full h-full bg-transparent text-white resize-none outline-none placeholder:text-slate-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleRecording}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                        isRecording 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isRecording ? <><MicOff className="w-5 h-5" /> Stop</> : <><Mic className="w-5 h-5" /> Record</>}
                    </button>
                    <button 
                      onClick={autofillVitals}
                      disabled={!transcript || isAutofilling}
                      className="flex-1 bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isAutofilling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      Autofill Params
                    </button>
                  </div>
                </div>

                {/* Vitals Parameters Grid */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid grid-cols-2 gap-4 content-start">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">BP Systolic</label>
                    <input type="number" name="bp_systolic" value={vitalsForm.bp_systolic} onChange={handleVitalChange} placeholder="120" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">BP Diastolic</label>
                    <input type="number" name="bp_diastolic" value={vitalsForm.bp_diastolic} onChange={handleVitalChange} placeholder="80" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Glucose (mg/dL)</label>
                    <input type="number" name="blood_glucose" value={vitalsForm.blood_glucose} onChange={handleVitalChange} placeholder="95" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Temp (°F)</label>
                    <input type="number" name="temperature" value={vitalsForm.temperature} onChange={handleVitalChange} placeholder="98.6" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Pulse (bpm)</label>
                    <input type="number" name="pulse" value={vitalsForm.pulse} onChange={handleVitalChange} placeholder="72" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">SpO2 (%)</label>
                    <input type="number" name="spo2" value={vitalsForm.spo2} onChange={handleVitalChange} placeholder="98" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Weight (kg)</label>
                    <input type="number" name="weight" value={vitalsForm.weight} onChange={handleVitalChange} placeholder="70" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Height (cm)</label>
                    <input type="number" name="height" value={vitalsForm.height} onChange={handleVitalChange} placeholder="170" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                </div>

              </div>

              <button 
                onClick={submitVitals}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 mt-auto"
              >
                Analyze Health Risk <Send className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 3: DETECTION */}
          {step === 'detection' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-green-400" /> Disease Detection Results
                  </h2>
                  <p className="text-slate-400">AI analysis based on your info and vitals.</p>
                </div>
                {!isAnalyzing && analysisResult && (
                  <button 
                    onClick={speakResult}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl font-medium transition-colors flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4" /> Listen to Result
                  </button>
                )}
              </header>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Analyzing Health Data</h3>
                  <p className="text-slate-400">Processing with ML models...</p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 whitespace-pre-wrap text-slate-300 leading-relaxed min-h-[250px]">
                  {analysisResult}
                </div>
              )}
              
              {!isAnalyzing && (
                <button 
                  onClick={() => setStep('vitals')}
                  className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors"
                >
                  Record Again
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
