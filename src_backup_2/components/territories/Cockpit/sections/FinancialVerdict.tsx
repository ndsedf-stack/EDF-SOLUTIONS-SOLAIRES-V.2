import React from 'react';
import { formatCurrency } from '../../WarRoom/utils';

export const FinancialVerdict = ({ stats }: { stats: any }) => {
  return (
    <div className="bg-[#0F1629] p-8 rounded-3xl border border-white/[0.05] shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40">
          S01 — VERDICT FINANCIER
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Sécurisé (Acompte)</span>
          <p className="text-4xl font-black text-white tracking-tighter">
            {formatCurrency(stats.cashSecured || 0)}
          </p>
        </div>
        
        <div className="space-y-1 border-l border-white/5 pl-12">
          <span className="text-[10px] font-black text-orange-400/60 uppercase tracking-widest">À Risque (Signé seul)</span>
          <p className="text-4xl font-black text-white tracking-tighter">
            {formatCurrency(stats.cashAtRisk || 0)}
          </p>
        </div>

        <div className="space-y-1 border-l border-white/5 pl-12">
          <span className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">Perte (Annulations)</span>
          <p className="text-4xl font-black text-white tracking-tighter opacity-40">
            {formatCurrency(stats.cashLost || 0)}
          </p>
        </div>
      </div>
    </div>
  );
};
