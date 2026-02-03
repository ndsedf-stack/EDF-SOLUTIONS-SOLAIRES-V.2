
import React from 'react';
import { Study } from '@/brain/types';
import { formatCurrency } from './utils';

// ============================================
// 🎯 EXECUTION DESK - OPS DESK V2 🦅
// ============================================
interface ExecutionDeskProps {
  show: boolean;
  priority: Study | null;
  onPrimaryAction: () => void;
  onScrollToWarRoom: () => void;
}

export const ExecutionDesk: React.FC<ExecutionDeskProps> = ({
  show,
  priority,
  onPrimaryAction,
  onScrollToWarRoom,
}) => {
  if (!show || !priority) return null;

  // Mapping intelligent pour le Desk d'Exécution
  const status = priority.status;
  const behavior = (priority as any).behavior;
  
  // Calculs de dates contextuelles
  const signedDate = priority.signed_at ? new Date(priority.signed_at).toLocaleDateString('fr-FR') : "N/A";
  const daysSinceAction = Math.floor((new Date().getTime() - new Date(priority.last_view || priority.created_at || new Date()).getTime()) / 86400000);

  const focus = {
    objective: status === 'signed' 
      ? (priority.deposit_paid ? "SÉCURISÉ ✅ (Acompte Reçu)" : "SÉCURISER 🚨 (Acompte Manquant)")
      : "CLOSING 🎯 (Dossier Chaud)",
    situation: status === 'signed' 
      ? `Client signé le ${signedDate}. ${priority.deposit_paid ? "Acompte à jour." : "Acompte attendu."}` 
      : "Prospect chaud. Momentum élevé.",
    whyNow: [
      `Momentum : ${(priority as any).dangerScore}% d'instabilité.`,
      `Silence : ${daysSinceAction > 0 ? daysSinceAction + ' jours' : 'Aujourd\'hui'} sans action.`,
       status === 'signed' && !(priority as any).deposit_paid ? `💰 Montant en jeu : ${formatCurrency((priority as any).total_price || 0)}` : "Dernière ligne droite."
    ],
    mainAction: priority.status === 'signed' ? `APPELER ${priority.name.split(" ")[0].toUpperCase()} — SÉCURISER` : `APPELER ${priority.name.split(" ")[0].toUpperCase()} — CLOSING`,
    risk: status === 'signed' ? "Risque Annulation" : "Risque Perte",
    stake: (priority as any).total_price || 0,
    deadline: "48:00"
  };

  return (
    <div id="execution-desk" className="mb-8 animate-fadeIn">
      <style>{`
          .desk-glass {
            background: linear-gradient(145deg, rgba(10, 15, 30, 0.7) 0%, rgba(2, 6, 23, 0.9) 100%);
            backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.4);
          }
          .premium-button {
            background: linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%);
            background-size: 200% auto;
            transition: 0.5s;
            box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.5);
          }
          .premium-button:hover {
            background-position: right center;
            transform: translateY(-1px);
            box-shadow: 0 12px 30px -10px rgba(59, 130, 246, 0.4);
          }
          .premium-button:active {
            transform: translateY(1px);
          }
          @keyframes glow-border {
            0%, 100% { border-color: rgba(59, 130, 246, 0.3); }
            50% { border-color: rgba(59, 130, 246, 0.6); }
          }
          .animate-glow-border {
            animation: glow-border 2s infinite ease-in-out;
          }
      `}</style>

      <div className="desk-glass rounded-3xl overflow-hidden animate-fadeIn">
        {/* HEADER */}
        <div className="px-10 py-5 bg-white/[0.02] border-b border-white/[0.05] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] animate-pulse" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400/80">
              COMMANDE OPÉRATIONNELLE <span className="text-zinc-600 ml-2 font-bold tracking-widest">(OPS-01)</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">System: Intelligent Priority Engine</span>
             <div className="h-3 w-px bg-white/10" />
             <span className="text-[9px] text-blue-500 font-black font-mono">LIVE</span>
          </div>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-12 gap-12">
            {/* ACTION CARD - LEFT SECTION */}
            <div className="col-span-12 lg:col-span-7 space-y-10">
              {/* Identity & Status */}
              <div>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-2 block">
                  {priority.status === 'signed' ? "Client Prioritaire" : "Prospect Prioritaire"}
                </span>
                <h3 className="text-5xl font-black text-white tracking-tighter mb-4 leading-none">
                  {priority.name.toUpperCase()}
                </h3>
                <div className="flex gap-4 items-center">
                   <div className="px-4 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-black uppercase tracking-[0.15em]">
                     Statut : {focus.situation.toUpperCase()}
                   </div>
                </div>
              </div>

              {/* Business Objective */}
              <div className="space-y-4">
                <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] block">🎯 Objectif de Fin de Cycle</span>
                <p className="text-2xl text-zinc-100 font-black leading-tight tracking-tight">
                  {focus.objective}
                </p>
              </div>

              {/* Why Now */}
              <div className="space-y-5">
                <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] block">💡 Facteurs de Tension IA</span>
                <div className="space-y-3">
                    {focus.whyNow.map((reason, idx) => (
                      <div key={idx} className="flex gap-4 items-start text-zinc-400 bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                        <p className="text-xs font-semibold leading-relaxed tracking-wide">{reason}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* ACTION CENTER - RIGHT SECTION */}
            <div className="col-span-12 lg:col-span-5 flex flex-col justify-between pt-6 lg:pt-0">
              {/* NEXT BEST ACTION focal point */}
              <div className="space-y-8">
                <div className="text-center p-10 bg-white/[0.01] border border-white/[0.05] rounded-3xl relative overflow-hidden group shadow-2xl animate-glow-border">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                  <span className="text-[10px] text-blue-500/70 font-black uppercase tracking-[0.4em] block mb-8">NEXT BEST ACTION</span>
                  
                  <button 
                    onClick={onPrimaryAction}
                    className="w-full py-8 premium-button rounded-2xl text-white text-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-4 group"
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform duration-300">📞</span>
                    <span>{focus.mainAction}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button 
                      onClick={() => window.location.href = `mailto:${priority.email}?subject=Suivi de votre dossier - EDF Solutions Solaires`}
                      className="py-4 bg-zinc-900/50 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest rounded-xl"
                    >
                      📧 Mail
                    </button>
                    <button 
                      onClick={onScrollToWarRoom}
                      className="py-4 bg-red-900/20 hover:bg-red-900/40 border border-red-500/20 text-red-500 hover:text-red-400 transition-all text-[11px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2"
                    >
                      <span>🚨</span> ALLER EN WAR ROOM
                    </button>
                  </div>
                </div>

                {/* MINI CONTEXT BAR */}
                <div className="grid grid-cols-3 gap-2 bg-black/40 p-6 rounded-3xl border border-white/5 shadow-inner">
                   <div className="text-center border-r border-white/5">
                     <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest block mb-2">Impact Cash</span>
                     <span className={`text-lg font-black font-mono tracking-tighter ${focus.stake > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>
                       {formatCurrency(focus.stake)}
                     </span>
                   </div>
                   <div className="text-center border-r border-white/5">
                     <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest block mb-2">Deadline</span>
                     <span className="text-lg font-black text-red-500/90 font-mono tracking-tighter">{focus.deadline}</span>
                   </div>
                   <div className="text-center">
                     <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest block mb-2">Risque</span>
                     <span className="text-[11px] font-black text-orange-500/90 uppercase leading-none block mt-1 tracking-tighter">
                       {focus.risk.split(' ')[0]} {focus.risk.split(' ')[1]}
                     </span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ✅ CRITICAL ALERT - ALERTES CRITIQUES GÉNÉRIQUES
// (Composant séparé pour d'autres types d'alertes)
// ============================================
interface CriticalAlertProps {
  show: boolean;
  message: string;
  state?: 'stable' | 'active' | 'warning' | 'critical';
  onDismiss?: () => void;
}

export const CriticalAlert: React.FC<CriticalAlertProps> = ({
  show,
  message,
  state = 'critical',
  onDismiss,
}) => {
  if (!show) return null;

  const config = {
    stable: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      titleColor: "text-emerald-400",
      textColor: "text-emerald-300/80",
      title: "SYSTÈME SOUS CONTRÔLE",
      icon: "🛡️",
      pulse: false
    },
    active: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      titleColor: "text-blue-400",
      textColor: "text-blue-300/80",
      title: "ACTIVITÉ SYSTÈME",
      icon: "🛰️",
      pulse: false
    },
    warning: {
      bg: "bg-orange-500/20",
      border: "border-orange-500/50",
      titleColor: "text-orange-400",
      textColor: "text-orange-300",
      title: "ATTENTION REQUISE",
      icon: "⚠️",
      pulse: true
    },
    critical: {
      bg: "bg-red-500/20",
      border: "border-red-500/50",
      titleColor: "text-red-400",
      textColor: "text-red-300",
      title: "ALERTE CRITIQUE",
      icon: "🚨",
      pulse: true
    }
  };

  const current = config[state] || config.critical;

  return (
    <div className={`${current.bg} border-2 ${current.border} rounded-2xl p-6 mb-8 ${current.pulse ? 'animate-pulse' : ''} backdrop-blur-md`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="text-4xl drop-shadow-lg">{current.icon}</div>
          <div>
            <h4 className={`text-xs font-black uppercase tracking-[0.3em] ${current.titleColor} mb-1`}>
              {current.title}
            </h4>
            <p className={`${current.textColor} text-sm font-semibold tracking-tight`}>{message}</p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${current.titleColor} opacity-50 hover:opacity-100 transition-all`}
          >
            <span className="text-xl">✕</span>
          </button>
        )}
      </div>
    </div>
  );
};
