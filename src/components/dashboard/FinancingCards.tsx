import React from 'react';
import { formatCurrency } from '../../utils/finance';

interface Props {
  mode: 'loan' | 'cash';
  monthlyPayment: number;
  durationMonths: number;
  cashDown?: number;
}

export const FinancingCards: React.FC<Props> = ({ mode, monthlyPayment, durationMonths, cashDown = 0 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" data-testid="financing-cards">
      <div className="bg-black/40 p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center backdrop-blur-xl hover:border-white/30 transition-all duration-500 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Mode de Financement</h3>
        <p className="text-xl md:text-2xl font-black text-white tracking-tight relative z-10">
          {mode === 'loan' ? 'CRÉDIT PARTENAIRE' : 'AUTO-FINANCEMENT'}
        </p>
        {mode === 'loan' && (
             <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-2 bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20 relative z-10">Partenaire Bancaire</p>
        )}
      </div>

      <div className="bg-black/40 p-6 rounded-2xl border border-white/10 flex flex-col items-center text-center backdrop-blur-xl hover:border-white/30 transition-all duration-500 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 relative z-10">Mensualité</h3>
        <p className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tighter relative z-10">
          {mode === 'loan' ? `${formatCurrency(monthlyPayment)} / mois` : '0 € / mois'}
        </p>
        {mode === 'loan' && durationMonths > 0 && (
          <p className="text-[10px] text-slate-600 font-mono mt-1 relative z-10">sur {durationMonths / 12} ans</p>
        )}
      </div>
    </div>
  );
};
