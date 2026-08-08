import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface RiskCardProps {
  title: string;
  score: number;
  reasons: string[];
}

export const RiskCard: React.FC<RiskCardProps> = ({ title, score, reasons }) => {
  const percentage = Math.round(score * 100);
  
  let level = 'Low';
  let colorClass = 'text-emerald-400';
  let bgClass = 'bg-emerald-500/10';
  let borderClass = 'border-emerald-500/30';
  let Icon = CheckCircle2;

  if (score > 0.7) {
    level = 'High';
    colorClass = 'text-rose-400';
    bgClass = 'bg-rose-500/10';
    borderClass = 'border-rose-500/30';
    Icon = AlertCircle;
  } else if (score >= 0.3) {
    level = 'Medium';
    colorClass = 'text-amber-400';
    bgClass = 'bg-amber-500/10';
    borderClass = 'border-amber-500/30';
    Icon = AlertTriangle;
  }

  return (
    <div className={`p-4 rounded-xl border ${bgClass} ${borderClass} backdrop-blur-sm transition-colors transition-transform duration-200`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-slate-100">{title}</h3>
          <p className={`text-sm font-medium flex items-center gap-1.5 mt-1 ${colorClass}`}>
            <Icon size={16} aria-hidden="true" />
            <span>{level} Risk</span>
            <span className="font-mono-tech tabular-nums text-xs opacity-90">({percentage}%)</span>
          </p>
        </div>
      </div>
      
      {reasons.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-slate-800/60 pt-2.5">
          <p className="text-xs text-slate-400 font-mono-tech uppercase tracking-wider mb-1.5">Key Factors:</p>
          <ul className="space-y-1">
            {reasons.map((reason, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-current ${colorClass}`} aria-hidden="true" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
