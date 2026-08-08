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
  let colorClass = 'text-green-500';
  let bgClass = 'bg-green-500/10';
  let borderClass = 'border-green-500/30';
  let Icon = CheckCircle2;

  if (score > 0.7) {
    level = 'High';
    colorClass = 'text-red-500';
    bgClass = 'bg-red-500/10';
    borderClass = 'border-red-500/30';
    Icon = AlertCircle;
  } else if (score >= 0.3) {
    level = 'Medium';
    colorClass = 'text-yellow-500';
    bgClass = 'bg-yellow-500/10';
    borderClass = 'border-yellow-500/30';
    Icon = AlertTriangle;
  }

  return (
    <div className={`p-4 rounded-xl border ${bgClass} ${borderClass} backdrop-blur-sm transition-all duration-300`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-slate-200">{title}</h3>
          <p className={`text-sm font-medium flex items-center gap-1 ${colorClass}`}>
            <Icon size={16} />
            {level} Risk ({percentage}%)
          </p>
        </div>
      </div>
      
      {reasons.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-xs text-slate-400 font-medium mb-2">Key Factors:</p>
          <ul className="space-y-1">
            {reasons.map((reason, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-current ${colorClass}`} />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
