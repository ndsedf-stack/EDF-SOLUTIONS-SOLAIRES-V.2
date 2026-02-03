import React from 'react';

export const ROIProductivityVisx = ({ stats }: { stats: any }) => {
  const hoursSaved = Math.round((stats.emailsSent * 15) / 60);

  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-12 rounded-3xl border border-indigo-500/20 flex flex-col gap-12">
      <div className="flex items-center justify-between">
        <div>
           <h3 className="text-white font-black uppercase tracking-widest text-xs mb-1">S0H — ROI & PRODUCTIVITÉ</h3>
           <p className="text-[11px] text-indigo-300/40 italic">"Gains d'efficacité machine vs humain"</p>
        </div>
        <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Automatisations Actives</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Temps libéré</span>
            <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-white tracking-tighter">{hoursSaved}h</span>
                <span className="text-xl font-bold text-white/20 uppercase tracking-tighter">Vente active</span>
            </div>
            <p className="text-[11px] text-indigo-300/30 leading-relaxed font-medium">Bénéfice immédiat sur le suivi post-signature et la relance des dossiers froids.</p>
        </div>

        <div className="space-y-4 border-l border-white/5 pl-12">
            <span className="text-[10px] font-black text-emerald-500/40 uppercase tracking-widest block">CA Sauvé (War Room)</span>
            <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-emerald-400 tracking-tighter">{Math.round((stats.caSauved || 0) / 1000)}k€</span>
            </div>
            <p className="text-[11px] text-emerald-300/30 leading-relaxed font-medium">Contrats qui auraient été annulés sans l'intervention prioritaire du Brain.</p>
        </div>

        <div className="space-y-4 border-l border-white/5 pl-12">
            <span className="text-[10px] font-black text-sky-500/40 uppercase tracking-widest block">Automations / Mois</span>
            <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black text-sky-400 tracking-tighter">{stats.emailsSent}</span>
            </div>
            <p className="text-[11px] text-sky-300/30 leading-relaxed font-medium">Nombre total de décisions et actions exécutées de manière autonome par le système.</p>
        </div>
      </div>
    </div>
  );
};
