"use client";

import React from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { LANGUAGES } from '@/lib/translations';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function LanguageSelector({ className = '', variant = 'full' }: LanguageSelectorProps) {
  const { language, setLanguage } = useAuthStore();

  return (
    <div className={`relative inline-flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 px-3 py-1.5 rounded-xl shadow-lg hover:border-emerald-500/50 transition-all flex-shrink-0 z-20 ${className}`}>
      <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" aria-hidden="true" />
      
      <select 
        value={language || 'en-US'}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Select Interface Language"
        className="bg-transparent border-none text-xs sm:text-sm font-medium text-white focus:outline-none focus:ring-0 cursor-pointer pr-5 appearance-none font-mono-tech"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code} className="bg-slate-900 text-white py-1">
            {variant === 'compact' ? lang.name.split(' ')[0] : lang.name}
          </option>
        ))}
      </select>

      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" aria-hidden="true" />
    </div>
  );
}
