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
    <div className="space-y-8">
      <div className="w-full h-10 bg-white/5 rounded-lg overflow-hidden flex border border-white/10 shadow-lg">
        <div 
          style={{ width: `${securedPct}%` }} 
          className="h-full bg-[#4ADE80] opacity-80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] transition-all duration-700" 
          title={`Sécurisé: ${data.securedCA.toLocaleString()}€`}
        />
        <div 
          style={{ width: `${exposedPct}%` }} 
          className="h-full bg-[#F59E0B] opacity-70 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] transition-all duration-700" 
          title={`Exposé: ${data.exposedCA.toLocaleString()}€`}
        />
        <div 
          style={{ width: `${cancelledPct}%` }} 
          className="h-full bg-[#F87171] opacity-60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] transition-all duration-700" 
          title={`Annulé: ${data.cancelledCA.toLocaleString()}€`}
        />
      </div>
      
      <div className="grid grid-cols-3 gap-8 px-2">
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#4ADE80]" />
              <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Sécurisé</span>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white/90 tabular-nums">{Math.round(securedPct)}%</span>
              <span className="text-sm font-bold text-white/20 tracking-tight">({Math.round(data.securedCA/1000)}k€)</span>
           </div>
        </div>
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
              <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Exposé</span>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white/90 tabular-nums">{Math.round(exposedPct)}%</span>
              <span className="text-sm font-bold text-white/20 tracking-tight">({Math.round(data.exposedCA/1000)}k€)</span>
           </div>
        </div>
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#F87171]" />
              <span className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Annulé</span>
           </div>
           <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white/90 tabular-nums">{Math.round(cancelledPct)}%</span>
              <span className="text-sm font-bold text-white/20 tracking-tight">({Math.round(data.cancelledCA/1000)}k€)</span>
           </div>
        </div>
      </div>
    </div>
  );
}
