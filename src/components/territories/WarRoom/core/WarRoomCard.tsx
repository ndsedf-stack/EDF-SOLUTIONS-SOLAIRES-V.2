import React from 'react';
import type { Study } from '@/brain/types';

interface WarRoomCardProps {
  study: Study;
  isWarRoom: boolean;
  daysSinceSigned: number;
  depositStatus: string;
  lastInteraction: Date | string | null;
}

export function WarRoomCard({ study, isWarRoom, daysSinceSigned, depositStatus, lastInteraction }: WarRoomCardProps) {
  return (
    <div 
      className={`relative p-8 mb-4 rounded-2xl border transition-all duration-300 hover:scale-[1.01] ${
        isWarRoom 
          ? 'bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/30 hover:border-red-500/50' 
          : 'bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20 hover:border-orange-500/40'
      }`}
      style={{
        backdropFilter: 'blur(20px)',
        boxShadow: isWarRoom 
          ? '0 0 40px rgba(239, 68, 68, 0.15)' 
          : '0 0 30px rgba(251, 146, 60, 0.1)'
      }}
    >
      {/* GLOW TOP BORDER */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${isWarRoom ? 'via-red-400' : 'via-orange-400'} to-transparent`} />
      
      <div className="flex items-center justify-between gap-8">
         {/* NOM + TEMPS */}
         <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
               {isWarRoom && <span className="text-2xl">🚨</span>}
               <div>
                  <p className="text-white font-black text-lg tracking-tight">{study.name}</p>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-wider mt-1">
                    Signé il y a {daysSinceSigned} jour{daysSinceSigned > 1 ? 's' : ''}
                  </p>
               </div>
            </div>
         </div>

         {/* ACOMPTE */}
         <div className="flex-1">
            <p className="text-white/40 text-[10px] uppercase tracking-[0.15em] font-black mb-2">Acompte</p>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${
              depositStatus.includes('PAYÉ') 
                ? 'bg-emerald-500/20 border-emerald-400/40' 
                : depositStatus.includes('EN ATTENTE')
                ? 'bg-orange-500/20 border-orange-400/40'
                : 'bg-slate-500/20 border-slate-400/40'
            }`}>
               <span className={`text-sm font-black uppercase tracking-wider ${
                 depositStatus.includes('PAYÉ') ? 'text-emerald-300' : 
                 depositStatus.includes('EN ATTENTE') ? 'text-orange-300' : 'text-slate-300'
               }`}>
                  {depositStatus}
               </span>
            </div>
         </div>

         {/* MONTANT + INTERACTION */}
         <div className="flex-1 text-right">
            <p className="text-white font-black text-2xl tracking-tighter mb-1">
              {Math.round(study.total_price / 1000)}k€
            </p>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.15em] font-bold">
               {lastInteraction ? (
                   <>Interaction il y a {Math.floor((new Date().getTime() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24))} j</>
               ) : 'Aucune interaction'}
            </p>
         </div>

         {/* RECOMMANDATION */}
         <div className="flex-1 flex justify-end">
            <div className={`px-6 py-3 rounded-xl border backdrop-blur-xl ${
              isWarRoom 
                ? 'bg-red-500/20 border-red-400/40' 
                : 'bg-orange-500/20 border-orange-400/40'
            }`}
            style={{
              boxShadow: isWarRoom 
                ? '0 0 20px rgba(239, 68, 68, 0.3)' 
                : '0 0 15px rgba(251, 146, 60, 0.2)'
            }}
            >
               <p className={`${isWarRoom ? 'text-red-300' : 'text-orange-300'} text-xs font-black uppercase tracking-[0.15em]`}>
                   {isWarRoom ? '🔥 Sécuriser Urgence' : '⚠️ Sécuriser'}
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
