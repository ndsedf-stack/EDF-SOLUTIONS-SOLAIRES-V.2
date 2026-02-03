import React from 'react';

export interface DealFocusProps {
  study: {
    id: string;
    name: string;
    totalPrice: number;
    dangerScore: number;
    daysBeforeDeadline: number;
  };
  recommendation: {
    type: string;
    reason: string;
    urgency: 'low' | 'medium' | 'high';
  };
  onAction: (id: string) => void;
}

export function DealFocusPanel({ study, recommendation, onAction }: DealFocusProps) {
  return (
    <div className="bg-gradient-to-br from-red-900/20 to-slate-900 p-12 rounded-3xl border border-red-500/20 flex flex-col gap-10">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
           <h2 className="text-4xl font-black text-white tracking-tighter">{study.name}</h2>
           <div className="flex gap-4">
              <span className="text-xl font-bold text-white/40">{Math.round(study.totalPrice).toLocaleString()} €</span>
              <div className="w-px h-6 bg-white/10" />
              <span className="text-xl font-black text-red-500">{study.daysBeforeDeadline} jours restants</span>
           </div>
        </div>
        
        <div className="text-right">
           <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] block mb-2">Danger Score</span>
           <span className="text-6xl font-black text-red-500 tracking-tighter">{study.dangerScore}</span>
        </div>
      </div>

      <div className="bg-black/40 p-10 rounded-2xl border border-white/5 space-y-4">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
            <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">Recommandation Stratégique</span>
         </div>
         <p className="text-2xl font-bold text-white leading-tight">
            "{recommendation.reason}"
         </p>
         <div className="pt-4 flex gap-8 border-t border-white/5">
            <div>
               <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block">Canal</span>
               <span className="text-sm font-black text-white uppercase tracking-tighter">{recommendation.type}</span>
            </div>
            <div>
               <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block">Niveau d'urgence</span>
               <span className={`text-sm font-black uppercase tracking-tighter ${
                 recommendation.urgency === 'high' ? 'text-red-500' : 'text-orange-400'
               }`}>{recommendation.urgency}</span>
            </div>
         </div>
      </div>

      <button 
        onClick={() => onAction(study.id)}
        className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.4em] text-sm rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition-all active:scale-95 translate-y-0 hover:-translate-y-1"
      >
        Lancer l'Intervention Humaine
      </button>
    </div>
  );
}
