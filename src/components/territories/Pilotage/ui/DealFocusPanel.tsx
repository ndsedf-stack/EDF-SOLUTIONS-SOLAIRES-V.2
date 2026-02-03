import React from 'react';

/**
 * 👑 DealFocusPanel
 * L'unité d'action de la War Room. 1 dossier = 1 action.
 * Valeur perçue : 30k€.
 */

export interface DealFocusProps {
  deal: {
    id: string;
    clientName: string;
    amount: number;
    daysSilent: number;
    lastEmailOpened: boolean;
    risk: 'low' | 'medium' | 'high';
  } | null;
  onAction?: (action: string) => void;
  onClose?: () => void;
}

export function DealFocusPanel({ deal, onAction, onClose }: DealFocusProps) {
  if (!deal) return null;

  const riskColor =
    deal.risk === 'high' ? '#F87171' :
    deal.risk === 'medium' ? '#FB923C' :
    '#4ADE80';

  return (
    <div className="flex flex-col gap-10 p-10 bg-[#0F1629] border border-white/[0.1] rounded-3xl shadow-2xl animate-in slide-in-from-right duration-500 font-sans backdrop-blur-xl">
      {/* HEADER — IDENTITÉ */}
      <header className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase font-bold tracking-[0.4em] text-white/20">Focus Dossier</span>
          <h2 className="text-3xl font-extrabold font-manrope tracking-tighter text-white">{deal.clientName}</h2>
          <span className="text-xs font-mono text-white/30 truncate max-w-[200px]">{deal.id}</span>
        </div>
        <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
        >
            ✕
        </button>
      </header>

      {/* METRICS — L'ÉTAT DES LIEUX */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-[#0A0E27] rounded-2xl border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-white/20 tracking-widest leading-none">Exposition</span>
            <span className="text-2xl font-black font-manrope">{deal.amount.toLocaleString()}€</span>
        </div>
        <div className="p-6 bg-[#0A0E27] rounded-2xl border border-white/5 flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-white/20 tracking-widest leading-none">Inertie</span>
            <span className="text-2xl font-black font-manrope">{deal.daysSilent}j</span>
        </div>
      </div>

      {/* ALERT STATUS */}
      <div 
        className="p-6 rounded-2xl border flex items-center gap-6 transition-all"
        style={{ 
            backgroundColor: `${riskColor}10`, 
            borderColor: `${riskColor}30`,
            color: riskColor 
        }}
      >
        <div className="text-3xl">
            {deal.risk === 'high' ? '🚨' : deal.risk === 'medium' ? '⚠️' : '🛡️'}
        </div>
        <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Niveau de Risque : {deal.risk}</span>
            <span className="text-xs font-medium opacity-80 italic">Probabilité d'annulation élevée détectée.</span>
        </div>
      </div>

      {/* LOGS — DERNIERS SIGNAUX */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[11px] uppercase font-bold tracking-[0.3em] text-white/20">Derniers signaux</h3>
        <ul className="flex flex-col gap-4 font-mono text-xs">
            <li className="flex items-center gap-3 text-white/60">
                <span className={deal.lastEmailOpened ? 'text-[#4ADE80]' : 'text-white/20'}>●</span>
                <span>Email de bienvenue : {deal.lastEmailOpened ? 'OUVERT' : 'IGNORÉ'}</span>
            </li>
            <li className="flex items-center gap-3 text-white/60">
                <span className="text-white/20">●</span>
                <span>Visite technique : <span className="text-white font-bold underline">STAGNANTE (J+4)</span></span>
            </li>
        </ul>
      </div>

      {/* ACTION — CTA UNIQUE ET MASSIIF (DOCTRINE AUTORITÉ) */}
      <footer className="mt-4">
        <button 
            onClick={() => onAction?.('relance')}
            className="w-full py-6 rounded-2xl font-black text-white uppercase tracking-[0.3em] text-sm transition-all hover:opacity-90 active:opacity-100 shadow-xl"
            style={{ backgroundColor: riskColor }}
        >
            ▶ Lancer Action Prioritaire
        </button>
        <p className="text-[10px] text-center text-white/20 mt-4 uppercase tracking-widest font-bold">
            Escalade immédiate vers responsable War Room
        </p>
      </footer>
    </div>
  );
}
