
import React from 'react';
import { Metrics } from '@/brain/types';

export const NextActionIndicator: React.FC<{ metrics: Metrics }> = ({
  metrics,
}) => {
  const urgency = metrics.urgencyMode;
  const focus = urgency.focus;

  // Helpers de formatage (identiques à ExecutionDesk pour cohérence)
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  // Calcul du contexte si un focus existe
  let contextInfo = "Analyse en cours...";
  let subContext = "";
  
  if (focus) {
    const signedDate = focus.signed_at 
        ? new Date(focus.signed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) 
        : null;
    
    // Calcul Jours de Silence
    const lastActivity = focus.last_view || focus.created_at || new Date().toISOString();
    const daysSince = Math.floor((new Date().getTime() - new Date(lastActivity).getTime()) / 86400000);
    
    // Construction du contexte riche
    const priceContext = focus.total_price ? formatCurrency(focus.total_price) : "Montant N/A";
    const dateContext = focus.status === 'signed' 
        ? (signedDate ? `Signé le ${signedDate}` : `Client Signé`) 
        : "Prospect";
    const silenceContext = daysSince > 0 ? `${daysSince}j silence` : "Actif ajd";

    contextInfo = `${priceContext} • ${dateContext}`;
    subContext = `${silenceContext} • ${focus.status === 'signed' ? 'Acompte manquant' : 'Closing requis'}`;
  }

  return (
    <div
      className={`
      relative overflow-hidden glass-panel p-5 rounded-2xl flex items-center gap-6 transition-all duration-500
      ${
        urgency.active
          ? "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
          : "border-white/5"
      }
    `}
    >
      {/* Animation de scan si urgent */}
      {urgency.active && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent animate-scan-line pointer-events-none"
          style={{ width: "200%", animationDuration: "2s" }}
        ></div>
      )}

      {/* ICONE LATÉRALE */}
      <div
        className={`
        relative w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl shadow-inner
        ${
          urgency.active
            ? "bg-red-500/20 text-red-500"
            : "bg-blue-500/20 text-blue-400"
        }
      `}
      >
        {urgency.active ? "🚨" : "🛡️"}
        {urgency.active && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        )}
      </div>

      {/* CONTENU CENTRAL */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              urgency.active ? "text-red-400" : "text-blue-400"
            }`}
          >
            {urgency.active ? "ACTION REQUISE" : "SYSTÈME STABLE"}
          </span>
        </div>
        
        <div className="text-white font-black tracking-tight text-lg leading-none truncate mb-1.5">
          {urgency.active ? (focus?.name?.toUpperCase() || "INCONNU") : "VEILLE ACTIVE"}
        </div>
        
        {urgency.active ? (
            <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-white font-bold bg-white/10 px-1.5 py-0.5 rounded">{contextInfo.split('•')[0]}</span>
                <span className="text-zinc-500 font-bold">•</span>
                <span className="text-zinc-400">{contextInfo.split('•')[1]}</span>
                <span className="text-zinc-500 font-bold">•</span>
                <span className={`font-bold ${subContext.includes('0j') ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {subContext.split('•')[0]}
                </span>
            </div>
        ) : (
            <div className="text-xs text-slate-500 font-medium">
                Aucune anomalie détectée. Flux nominaux.
            </div>
        )}
      </div>

      {/* JAUGE DE TENSION */}
      <div className="text-right border-l border-white/10 pl-6 flex flex-col justify-center h-full">
        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">
          Tension
        </div>
        <div
          className={`text-xl font-mono font-black tracking-tighter ${
            urgency.active ? "text-red-500" : "text-emerald-500"
          }`}
        >
          {urgency.active ? "CRITIQUE" : "NOMINALE"}
        </div>
      </div>
    </div>
  );
};
