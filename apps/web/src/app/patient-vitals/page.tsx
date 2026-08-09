"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { Mic, MicOff, Globe, Activity, Send, Loader2, User, HeartPulse, FileText, MapPin, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

import { LANGUAGES, UI_TRANS, getUITrans } from '@/lib/translations';
import { LanguageSelector } from '@/components/LanguageSelector';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { db, routePatientToNearestPHCDatabase } from '@/lib/db';
import { syncManager } from '@/lib/sync';

export default function PatientDashboard() {
  const { token, user, language, setLanguage } = useAuthStore();
  const t = getUITrans(language);
  const [step, setStep] = useState<'info' | 'vitals' | 'detection'>('info');

  // Info State
  const [infoForm, setInfoForm] = useState({
    age: '',
    gender: 'Male',
    village: '',
    familyHistory: ''
  });
  const [infoSaved, setInfoSaved] = useState(false);
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);
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
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Clean up speech synthesis when component unmounts or step changes
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [step]);

  const speakResult = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error(UI_TRANS[language]?.audioFailed || 'Audio playback is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast(UI_TRANS[language]?.audioStopped || 'Audio playback stopped.', { icon: 'ℹ️' });
      return;
    }

    if (!analysisResult) {
      toast.error('No analysis result to read out.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any previous speech

    // Format clean text for text-to-speech engine
    const textToSpeak = analysisResult
      .replace(/[*#_`]/g, '')
      .replace(/\[Offline Diagnostic Model\]/g, 'Diagnostic Summary.')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language;
    utterance.rate = 0.92; // Slightly natural pace for clarity

    // Select the best matching browser voice for the target language
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices && availableVoices.length > 0) {
      const targetLangLower = language.toLowerCase();
      const targetPrefix = language.split('-')[0].toLowerCase();
      
      // 1. Exact match (e.g. "hi-IN")
      let bestVoice = availableVoices.find(v => v.lang.toLowerCase() === targetLangLower);
      // 2. Prefix match (e.g. "hi" or "hi_IN")
      if (!bestVoice) {
        bestVoice = availableVoices.find(v => 
          v.lang.toLowerCase().startsWith(targetPrefix) || 
          v.lang.toLowerCase().includes(targetPrefix)
        );
      }
      // 3. Name match for language (e.g., "Hindi", "Bengali", "Tamil", etc.)
      if (!bestVoice) {
        const langObj = LANGUAGES.find(l => l.code === language);
        if (langObj) {
          const pureLangName = langObj.name.split(' ')[0].toLowerCase();
          bestVoice = availableVoices.find(v => v.name.toLowerCase().includes(pureLangName));
        }
      }

      if (bestVoice) {
        utterance.voice = bestVoice;
        console.log(`[TTS Engine] Matched Voice: ${bestVoice.name} (${bestVoice.lang}) for ${language}`);
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (err) => {
      // Do not display failure toast if speech was deliberately stopped/canceled
      if (err.error === 'interrupted' || err.error === 'canceled') {
        setIsSpeaking(false);
        return;
      }
      console.error('Speech synthesis error:', err);
      setIsSpeaking(false);
      toast.error(UI_TRANS[language]?.audioFailed || 'Audio playback failed.');
    };

    window.speechSynthesis.speak(utterance);
  };


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language; // IMPORTANT: Set initial language

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

  // Update speech recognition language when user changes dropdown
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let placeName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
            headers: { 'Accept-Language': 'en' }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.address) {
              const { village, town, city, suburb, county, state_district, state } = data.address;
              const place = village || town || city || suburb || state_district || county;
              if (place && state) {
                placeName = `${place}, ${state}`;
              } else if (place) {
                placeName = place;
              } else if (data.display_name) {
                placeName = data.display_name.split(',').slice(0, 2).join(',').trim();
              }
            }
          }
        } catch (e) {
          console.warn('Reverse geocoding failed:', e);
        }
        setInfoForm(prev => ({ ...prev, village: placeName }));
        toast.success(`Location acquired: ${placeName}`);
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

    const payload = {
      name: user?.name || 'Patient',
      age: Number(infoForm.age),
      gender: infoForm.gender,
      village: infoForm.village,
      family_history: infoForm.familyHistory
    };

    try {
      const res = await fetch(`${apiUrl}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const patientData = await res.json();
        setCreatedPatientId(patientData.id);
        toast.success('Information saved successfully!');
        setInfoSaved(true);
        setStep('vitals');
        return;
      }
    } catch (error) {
      console.warn('Network offline, saving patient locally to nearest PHC database:', error);
    }

    // Offline Mode Fallback
    const offlineId = `LOCAL-${Date.now()}`;
    const offlinePatient = {
      id: offlineId,
      name: payload.name,
      age: payload.age,
      gender: payload.gender,
      village: payload.village,
      family_history: payload.family_history ? { note: payload.family_history } : null,
      syncStatus: 'pending' as const
    };

    try {
      await routePatientToNearestPHCDatabase(offlinePatient);
      await syncManager.enqueue('create_patient', offlinePatient);
      toast.success('⚡ Offline Mode: Information saved to local PHC database!', { icon: '⚡' });
    } catch (dbErr) {
      console.error('Dexie save warning:', dbErr);
    }

    setCreatedPatientId(offlineId);
    setInfoSaved(true);
    setStep('vitals');
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
    
    // Calculate deterministic risk level for backend
    let riskScore = 0;
    let conditions = [];
    let advice = [];
    const lowerTranscript = transcript.toLowerCase();
    
    const glucose = Number(vitalsForm.blood_glucose);
    const sys = Number(vitalsForm.bp_systolic);
    const dia = Number(vitalsForm.bp_diastolic);
    const temp = Number(vitalsForm.temperature);
    
    const t = UI_TRANS[language] || UI_TRANS['en-US'];

    if (lowerTranscript.includes('sugar') || lowerTranscript.includes('diabetes') || glucose > 140) {
      riskScore += 30;
      conditions.push(t.condBP); 
    }
    if (lowerTranscript.includes('pressure') || lowerTranscript.includes('bp') || sys > 140 || dia > 90) {
      riskScore += 30;
      conditions.push(t.condBP);
      advice.push(t.advBP);
    }
    if (lowerTranscript.includes('fever') || lowerTranscript.includes('temperature') || temp > 99.5) {
      riskScore += 20;
      conditions.push(t.condFever);
      advice.push(t.advFever);
    }
    if (lowerTranscript.includes('chest') || lowerTranscript.includes('pain') || lowerTranscript.includes('breath')) {
      riskScore += 40;
      conditions.push(t.condCVD);
      advice.push(t.advCVD);
    }
    
    let level = t.lowRisk;
    let alertLevel = 'GREEN_ALERT';
    let summary = t.stableSummary;
    if (riskScore >= 50) {
      level = t.highRisk;
      alertLevel = 'RED_ALERT';
      summary = t.criticalSummary;
    } else if (riskScore > 0) {
      level = t.modRisk;
      alertLevel = 'YELLOW_ALERT';
      summary = t.modSummary;
    }
    
    let finalDiagnosisText = '';
    
    try {
      const langName = LANGUAGES.find(l => l.code === language)?.name || 'English';
      const vitalsString = JSON.stringify(vitalsForm);
      const prompt = `Act as a medical risk analyzer. Patient Age: ${infoForm.age}, Gender: ${infoForm.gender}, Family History: ${infoForm.familyHistory}. Patient Vitals entered: ${vitalsString}. Patient Symptoms Audio Transcript: "${transcript}". Provide a detailed disease detection analysis and risk assessment. YOU MUST OUTPUT ENTIRELY IN THIS LANGUAGE: ${langName}.`;

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: prompt,
          language: language,
          max_tokens: 3000
        })
      });

      if (response.ok) {
        const data = await response.json();
        finalDiagnosisText = data.reply || data.response || data.answer || "Analysis complete.";
        setAnalysisResult(finalDiagnosisText);
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Network error or AI unavailable');
      }
    } catch (error) {
      console.error('Online LLM failed, using offline math model', error);
      
      const diagnosisText = `${t.offlineHeader}

${t.riskAssessment}: ${level}
${t.summaryLabel}: ${summary}

${t.detectedFlags}:
${conditions.length > 0 ? conditions.map((c: string) => '- ' + c).join('\n') : t.noMajorFlags}

${t.recommendedAction}:
${advice.length > 0 ? advice.map((a: string) => '- ' + a).join('\n') : t.maintainDiet}

${t.offlineNote}`;

      finalDiagnosisText = diagnosisText;
      setAnalysisResult(diagnosisText);
    }
    
    // SAVE TO BACKEND / OFFLINE PHC DATABASE
    if (createdPatientId) {
      const screeningPayload = {
        id: `SCR-${Date.now()}`,
        patient_id: createdPatientId,
        bp_systolic: sys || 0,
        bp_diastolic: dia || 0,
        blood_glucose: glucose || 0,
        temperature: temp || 0,
        pulse: Number(vitalsForm.pulse) || 0,
        spo2: Number(vitalsForm.spo2) || 0,
        weight: Number(vitalsForm.weight) || 0,
        height: Number(vitalsForm.height) || 0,
        risk_level: alertLevel,
        risk_explanation: JSON.stringify({ ai_summary: finalDiagnosisText }),
        symptoms: transcript ? [transcript] : [],
        syncStatus: 'pending'
      };

      try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const sRes = await fetch(`${apiUrl}/api/screenings`, {
          method: 'POST',
          headers,
          body: JSON.stringify(screeningPayload)
        });
        
        if (sRes.ok) {
          if (alertLevel !== 'GREEN_ALERT') {
            toast.success('Alert routed to nearest PHC automatically.');
          }
          setIsAnalyzing(false);
          setStep('detection');
          return;
        }
      } catch (err) {
        console.warn('Network offline, saving screening to local IndexedDB:', err);
      }

      // Offline Mode Fallback
      try {
        await db.screenings.add(screeningPayload as any);
        await syncManager.enqueue('create_screening', screeningPayload);
        toast.success('⚡ Offline Mode: Screening saved locally! Will sync when online.', { icon: '⚡' });
      } catch (dbErr) {
        console.error('Offline screening save error:', dbErr);
      }
    }

    setIsAnalyzing(false);
    setStep('detection');
  };

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVitalsForm({ ...vitalsForm, [e.target.name]: e.target.value });
  };



  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Top Header Bar with Language Selector & Back Button */}
        <div className="flex items-center justify-between mb-4 px-1">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> {t.backDashboard}
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">{t.languageLabel || 'Language'}:</span>
            <LanguageSelector />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white/5 backdrop-blur-md rounded-2xl p-2 mb-6 border border-white/10 gap-2">
          <button 
            onClick={() => setStep('info')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${step === 'info' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            1. {t.tab1}
          </button>
          <button 
            onClick={() => infoSaved && setStep('vitals')}
            disabled={!infoSaved}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${step === 'vitals' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : infoSaved ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 cursor-not-allowed'}`}
          >
            2. {t.tab2}
          </button>
          <button 
            onClick={() => (infoSaved && (transcript || vitalsForm.temperature)) && setStep('detection')}
            disabled={!infoSaved || (!transcript && !vitalsForm.temperature)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${step === 'detection' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' : infoSaved && (transcript || vitalsForm.temperature) ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 cursor-not-allowed'}`}
          >
            3. {t.tab3}
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          {/* STEP 1: INFO */}
          {step === 'info' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-400" /> {t.header1}
                </h2>
                <p className="text-slate-400">{t.sub1}</p>
              </header>

              <form onSubmit={handleInfoSubmit} className="space-y-4 max-w-2xl mx-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">{t.age}</label>
                    <input 
                      type="number" 
                      required
                      value={infoForm.age}
                      onChange={e => setInfoForm({...infoForm, age: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">{t.gender}</label>
                    <select 
                      value={infoForm.gender}
                      onChange={e => setInfoForm({...infoForm, gender: e.target.value})}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option>{t.male}</option>
                      <option>{t.female}</option>
                      <option>{t.other}</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-slate-400">{t.location}</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      required
                      value={infoForm.village}
                      onChange={e => setInfoForm({...infoForm, village: e.target.value})}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500"
                      placeholder={t.locPlaceholder}
                    />
                    <button 
                      type="button" 
                      onClick={handleGetLocation}
                      disabled={locating}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                      {locating ? t.locating : t.getLocation}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-400">{t.history}</label>
                  <textarea 
                    rows={3}
                    placeholder={t.historyPlaceholder}
                    value={infoForm.familyHistory}
                    onChange={e => setInfoForm({...infoForm, familyHistory: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors mt-6">
                  {t.saveAndContinue}
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
                    <HeartPulse className="w-6 h-6 text-pink-400" /> {t.header2}
                  </h2>
                  <p className="text-slate-400">{t.sub2}</p>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                
                {/* Audio Recording & Transcript */}
                <div className="flex flex-col gap-4">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 min-h-[200px] relative">
                    <textarea 
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder={t.recordPlaceholder}
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
                      {isRecording ? <><MicOff className="w-5 h-5" /> {t.stop}</> : <><Mic className="w-5 h-5" /> {t.record}</>}
                    </button>
                    <button 
                      onClick={autofillVitals}
                      disabled={!transcript || isAutofilling}
                      className="flex-1 bg-blue-600/20 text-blue-400 border border-blue-500/50 hover:bg-blue-600/30 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isAutofilling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {t.autofill}
                    </button>
                  </div>
                </div>

                {/* Vitals Parameters Grid */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 grid grid-cols-2 gap-4 content-start">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{t.sys}</label>
                    <input type="number" name="bp_systolic" value={vitalsForm.bp_systolic} onChange={handleVitalChange} placeholder="120" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{t.dia}</label>
                    <input type="number" name="bp_diastolic" value={vitalsForm.bp_diastolic} onChange={handleVitalChange} placeholder="80" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{t.glucose}</label>
                    <input type="number" name="blood_glucose" value={vitalsForm.blood_glucose} onChange={handleVitalChange} placeholder="95" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{t.temp}</label>
                    <input type="number" name="temperature" value={vitalsForm.temperature} onChange={handleVitalChange} placeholder="98.6" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{t.pulse}</label>
                    <input type="number" name="pulse" value={vitalsForm.pulse} onChange={handleVitalChange} placeholder="72" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{t.spo2}</label>
                    <input type="number" name="spo2" value={vitalsForm.spo2} onChange={handleVitalChange} placeholder="98" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{t.weight}</label>
                    <input type="number" name="weight" value={vitalsForm.weight} onChange={handleVitalChange} placeholder="70" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">{t.height}</label>
                    <input type="number" name="height" value={vitalsForm.height} onChange={handleVitalChange} placeholder="170" className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-white" />
                  </div>
                </div>

              </div>

              <button 
                onClick={submitVitals}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 mt-auto cursor-pointer"
              >
                {t.analyzeBtn} <Send className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 3: DETECTION */}
          {step === 'detection' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-6 h-6 text-green-400" /> {t.header3}
                  </h2>
                  <p className="text-slate-400">{t.sub3}</p>
                </div>
                {!isAnalyzing && analysisResult && (
                  <button 
                    onClick={speakResult}
                    className={`py-2 px-4 rounded-xl font-medium transition-all flex items-center gap-2 text-white shadow-lg ${
                      isSpeaking 
                        ? 'bg-rose-600 hover:bg-rose-700 animate-pulse shadow-rose-500/30 ring-2 ring-rose-400/50' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                    }`}
                  >
                    {isSpeaking ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isSpeaking ? 'Stop Audio' : t.listen}</span>
                  </button>
                )}
              </header>

              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">{t.analyzing}</h3>
                  <p className="text-slate-400">{t.processing}</p>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 whitespace-pre-wrap text-slate-300 leading-relaxed min-h-[250px] max-h-[550px] overflow-y-auto custom-scrollbar">
                  {analysisResult}
                </div>
              )}
              
              {!isAnalyzing && (
                <button 
                  onClick={() => setStep('vitals')}
                  className="mt-6 w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  {t.recordPlaceholder ? t.record : 'Record Again'}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
