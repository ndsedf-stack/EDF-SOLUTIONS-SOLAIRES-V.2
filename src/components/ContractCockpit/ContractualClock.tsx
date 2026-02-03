import React from 'react';
import { TimeSegment } from './contractEngine';

interface Props {
  segments: TimeSegment[];
}

export function ContractualClock({ segments }: Props) {
  const total = segments.reduce((sum, s) => sum + s.amount, 0);

  const dangerColors = {
    low: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    medium: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    high: 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
    critical: 'from-red-500/20 to-red-500/5 border-red-500/30',
  };

  const dangerGlow = {
    low: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
    medium: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    high: 'shadow-[0_0_30px_rgba(249,115,22,0.2)]',
    critical: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-red-500 rounded-full" />
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            ⏳ HORLOGE CONTRACTUELLE
          </h2>
          <div className="text-xs text-white/40 font-mono uppercase tracking-wider">
            Pression temporelle par âge de signature
          </div>
        </div>
      </div>

      {/* Radial Segments */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {segments.map((segment, index) => {
          const percentage = total > 0 ? (segment.amount / total) * 100 : 0;
          
          return (
            <div
              key={index}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${dangerColors[segment.danger_level]} border backdrop-blur-xl p-6 ${dangerGlow[segment.danger_level]} group hover:scale-[1.02] transition-all duration-300`}
            >
              {/* Radial Progress Indicator */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-20">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={`${percentage * 2.51} 251`}
                    className="text-white"
                  />
                </svg>
              </div>

              <div className="relative z-10">
                {/* Range Label */}
                <div className="text-[11px] font-black uppercase tracking-[0.15em] text-white/40 mb-2">
                  {segment.range}
                </div>
                
                {/* Segment Title */}
                <div className="text-lg font-black text-white mb-4">
                  {segment.label}
                </div>

                {/* Stats Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Contrats</span>
                    <span className="text-sm font-bold text-white">{segment.count}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Montant</span>
                    <span className="text-sm font-bold text-white">{segment.amount.toLocaleString()} €</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Taux annulation</span>
                    <span className="text-sm font-bold text-white">{(segment.historical_cancel_rate * 100).toFixed(1)}%</span>
                  </div>
                  
                  {/* Danger Indicator */}
                  <div className="pt-2 mt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        segment.danger_level === 'critical' ? 'bg-red-500' :
                        segment.danger_level === 'high' ? 'bg-orange-500' :
                        segment.danger_level === 'medium' ? 'bg-amber-500' :
                        'bg-blue-500'
                      } animate-pulse`} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                        {segment.danger_level === 'critical' ? 'Critique' :
                         segment.danger_level === 'high' ? 'Élevé' :
                         segment.danger_level === 'medium' ? 'Moyen' :
                         'Faible'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
