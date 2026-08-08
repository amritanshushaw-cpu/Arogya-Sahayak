import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function RegisterPatient() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 pb-20">
      <header className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Register Patient</h1>
          <p className="text-xs text-slate-400">नया मरीज रजिस्टर करें</p>
        </div>
      </header>

      <form className="space-y-5">
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">
            Full Name / पूरा नाम
          </label>
          <input 
            type="text" 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            placeholder="Enter patient's name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">
              Age / उम्र
            </label>
            <input 
              type="number" 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-lg focus:outline-none focus:border-primary transition-all"
              placeholder="Years"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300">
              Gender / लिंग
            </label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-lg focus:outline-none focus:border-primary transition-all appearance-none">
              <option value="">Select</option>
              <option value="F">Female / महिला</option>
              <option value="M">Male / पुरुष</option>
              <option value="O">Other / अन्य</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">
            Phone Number / फोन नंबर
          </label>
          <input 
            type="tel" 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-lg focus:outline-none focus:border-primary transition-all"
            placeholder="10 digit number"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-300">
            Village / गांव
          </label>
          <input 
            type="text" 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-lg focus:outline-none focus:border-primary transition-all"
            placeholder="Village name"
          />
        </div>

        <button 
          type="button"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-4 rounded-xl flex items-center justify-center gap-2 mt-8 shadow-lg shadow-primary/25"
        >
          <Save size={20} />
          Save Patient / सुरक्षित करें
        </button>
      </form>
    </div>
  );
}
