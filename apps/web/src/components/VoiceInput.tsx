"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { extractVitalsFromText, ExtractedVitals } from '@/lib/ml/nerParser';
import { useAuthStore } from '@/lib/authStore';

interface VoiceInputProps {
  onVitalsExtracted: (vitals: ExtractedVitals, transcript: string) => void;
}

// Augment window object for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceInput({ onVitalsExtracted }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const language = useAuthStore((state) => state.language);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results ?? []) as any[];
      const transcript = results[0]?.[0]?.transcript?.trim() ?? '';
      if (!transcript) return;

      const vitals = extractVitalsFromText(transcript);
      onVitalsExtracted(vitals, transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [onVitalsExtracted]);

  const toggleListening = () => {
    if (!isSupported) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      onClick={toggleListening}
      type="button"
      aria-label={isListening ? "Stop listening for vitals" : "Start voice input for vitals"}
      className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-lg transition-colors transition-transform z-20 relative focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none ${
        isListening 
          ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-red-500/20 animate-pulse' 
          : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-indigo-500/20 hover:bg-indigo-500/30'
      }`}
      title={isListening ? "Listening…" : "Tap to speak vitals"}
    >
      {isListening ? <MicOff size={24} aria-hidden="true" /> : <Mic size={24} aria-hidden="true" />}
    </button>
  );
}
