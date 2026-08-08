"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { extractVitalsFromText, ExtractedVitals } from '@/lib/ml/nerParser';

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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // Set to Indian English to better capture transliterated terms
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const vitals = extractVitalsFromText(transcript);
        onVitalsExtracted(vitals, transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
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
      className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-lg transition-all z-20 relative ${
        isListening 
          ? 'bg-red-500/20 text-red-500 border-red-500/50 shadow-red-500/20 animate-pulse' 
          : 'bg-primary/20 text-primary border-primary/30 shadow-primary/20 hover:bg-primary/30'
      }`}
      title={isListening ? "Listening..." : "Tap to speak vitals"}
    >
      {isListening ? <MicOff size={24} /> : <Mic size={24} />}
    </button>
  );
}
