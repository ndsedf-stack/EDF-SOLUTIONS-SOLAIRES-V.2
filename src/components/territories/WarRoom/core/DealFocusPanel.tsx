import React from 'react';
import { motion } from 'framer-motion';

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
  const isCritical = study.dangerScore > 70;
  
  return (
    <div className="h-full bg-[#0B0F14] rounded-xl border border-white/5 flex flex-col overflow-hidden backdrop-blur-sm shadow-2xl">
      {/* 1. HEADER: IDENTITÉ (Sobre & Structuré) */}
      <div className="p-6 border-b border-white/5 flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-1 font-sans">
            {study.name}
          </h2>
          <div className="flex items-center gap-3 text-sm font-medium font-mono text-slate-500">
            <span className="text-emerald-400/80">
              {Math.round(study.totalPrice).toLocaleString()} €
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className={isCritical ? 'text-red-400' : 'text-amber-400'}>
              J-{study.daysBeforeDeadline}
            </span>
          </div>
        </div>
        
        {/* INDICATEUR RISQUE (Discret mais clair) */}
        <div className={`
          flex flex-col items-center justify-center w-12 h-12 rounded-lg border 
          ${isCritical 
            ? 'bg-red-500/5 border-red-500/20 text-red-500' 
            : 'bg-amber-500/5 border-amber-500/20 text-amber-500'}
        `}>
          <span className="text-lg font-bold leading-none">{study.dangerScore}</span>
        </div>
      </div>

      {/* 2. CORE: INSIGHT DÉCISIONNEL */}
      <div className="flex-1 p-6 space-y-6">
        
        {/* CONTEXTE */}
        <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Analyse Comportementale
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-white/10 pl-3 italic">
              "{recommendation.reason}"
            </p>
        </div>

        {/* DATA POINTS CLÉS */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Stratégie</span>
                <span className="text-xs font-semibold text-slate-200">{recommendation.type}</span>
            </div>
            <div className="bg-white/[0.02] p-3 rounded-lg border border-white/5">
               <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Urgence</span>
               <div className="flex items-center gap-2">
                   <div className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                   <span className="text-xs font-semibold text-slate-200 uppercase">{recommendation.urgency}</span>
               </div>
            </div>
        </div>

      </div>

      {/* 3. FOOTER: ACTION (Secondaire pro) */}
      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
        <button 
          onClick={() => onAction(study.id)}
          className={`
            w-full py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all duration-200
            ${isCritical 
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20' 
              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'}
          `}
        >
          <span className="text-xs font-bold uppercase tracking-wider">
            {isCritical ? 'Déclencher Intervention' : 'Actions de Relance'}
          </span>
          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
