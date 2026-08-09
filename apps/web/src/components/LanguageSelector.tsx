"use client";

import React from 'react';
import { Globe } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import { LANGUAGES } from '@/lib/translations';

export function LanguageSelector() {
  const { language, setLanguage } = useAuthStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-2 rounded-2xl shadow-xl">
      <Globe className="w-5 h-5 text-emerald-400" />
      <select 
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="bg-transparent border-none text-sm text-white focus:outline-none focus:ring-0 cursor-pointer"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
