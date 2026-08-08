"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Globe, Activity, Send, Loader2, RefreshCw } from 'lucide-react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://schemegg.onrender.com';

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

export default function PatientVitals() {
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize SpeechRecognition
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

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscript('');
      setAnalysisResult(null);
    }
  };

  const analyzeVitals = async () => {
    if (!transcript.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    
    try {
      const langName = LANGUAGES.find(l => l.code === selectedLang)?.name || 'English';
      
      const prompt = `Act as a mathematical risk analyzer for medical vitals. Analyze the following patient transcript describing their symptoms/vitals. Calculate a risk score and provide a brief assessment. YOU MUST OUTPUT YOUR RESPONSE ENTIRELY IN THE LANGUAGE: ${langName}. Transcript: "${transcript}"`;

      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data.reply || data.response || data.answer || "Analysis complete. Consult a doctor.");
    } catch (error) {
      console.error(error);
      setAnalysisResult("Error analyzing vitals. Please try again or type manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-2xl relative z-10">
        
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          <header className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/20 rounded-2xl">
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Patient Vitals Input</h1>
              <p className="text-slate-400 text-sm">Speak your symptoms securely for AI analysis</p>
            </div>
          </header>

          <div className="space-y-6">
            
            {/* Language Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-400 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Select Language
              </label>
              <select 
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-all"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Audio Input / Transcript Area */}
            <div className="flex flex-col gap-2 relative group">
              <label className="text-sm text-slate-400">Vitals / Symptoms Description</label>
              <textarea 
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Click the microphone and start speaking..."
                className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all"
              />
              
              <button
                onClick={toggleRecording}
                className={`absolute bottom-4 right-4 p-4 rounded-full shadow-lg transition-all transform active:scale-95 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
              </button>
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeVitals}
              disabled={isAnalyzing || !transcript.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/25 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Risk...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Analyze Vitals (AI)
                </>
              )}
            </button>

            {/* Analysis Result */}
            {analysisResult && (
              <div className="mt-6 p-5 bg-purple-500/10 border border-purple-500/20 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> AI Risk Assessment
                </h3>
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {analysisResult}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
