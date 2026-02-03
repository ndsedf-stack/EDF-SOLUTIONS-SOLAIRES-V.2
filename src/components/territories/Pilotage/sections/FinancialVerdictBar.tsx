import React from 'react';

export type VerdictData = {
  securedCA: number;
  exposedCA: number;
  cancelledCA: number;
};

export function FinancialVerdictBar({ data }: { data: VerdictData }) {
  const total = data.securedCA + data.exposedCA + data.cancelledCA;
  const securedPct = total > 0 ? (data.securedCA / total) * 100 : 0;
  const exposedPct = total > 0 ? (data.exposedCA / total) * 100 : 0;
  const cancelledPct = total > 0 ? (data.cancelledCA / total) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="w-full h-12 bg-white/5 rounded-full overflow-hidden flex border border-white/5">
        <div 
          style={{ width: `${securedPct}%` }} 
          className="h-full bg-emerald-500 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.2)]" 
          title={`Sécurisé: ${data.securedCA.toLocaleString()}€`}
        />
        <div 
          style={{ width: `${exposedPct}%` }} 
          className="h-full bg-orange-400 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.2)]" 
          title={`Exposé: ${data.exposedCA.toLocaleString()}€`}
        />
        <div 
          style={{ width: `${cancelledPct}%` }} 
          className="h-full bg-red-500 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.2)]" 
          title={`Annulé: ${data.cancelledCA.toLocaleString()}€`}
        />
      </div>
      
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-1">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500" />
           <span className="text-white/60">Sécurisé: {Math.round(securedPct)}%</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-orange-400" />
           <span className="text-white/60">Exposé: {Math.round(exposedPct)}%</span>
        </div>
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-500" />
           <span className="text-white/60">Annulé: {Math.round(cancelledPct)}%</span>
        </div>
      </div>
    </div>
  );
}
