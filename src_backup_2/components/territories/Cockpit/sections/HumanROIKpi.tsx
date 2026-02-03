import React from 'react';

export const HumanROIKpi = ({ emailsSent }: { emailsSent: number }) => {
  const hoursSaved = Math.round((emailsSent * 15) / 60);

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-12 rounded-3xl border border-indigo-500/20 flex flex-col md:flex-row justify-between items-center gap-12">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
          <p className="text-[11px] font-black text-indigo-300 uppercase tracking-[0.4em]">S03 — ROI HUMAIN</p>
        </div>
        <div className="flex items-baseline gap-3">
          <p className="text-8xl font-black text-white tracking-tighter">
            {hoursSaved}h
          </p>
          <span className="text-2xl font-black text-indigo-400/40 uppercase tracking-tighter">Économisées</span>
        </div>
      </div>
      
      <div className="flex-1">
         <p className="text-indigo-200/50 text-base font-semibold italic border-l-2 border-indigo-500/20 pl-8 py-2">
           "Pourquoi payer cet outil ? Pour libérer {hoursSaved} heures de vente active ce mois-ci grâce aux automatisations de suivi."
         </p>
      </div>
    </div>
  );
};
