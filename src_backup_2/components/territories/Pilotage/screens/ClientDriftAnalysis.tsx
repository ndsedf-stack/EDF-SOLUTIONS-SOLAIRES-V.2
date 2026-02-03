import React from 'react';
import { BehaviorDriftTimelineVisx, DriftMetrics } from '../core/BehaviorDriftTimelineVisx';

/**
 * 🟦 ÉCRAN 2 — DRIFT CLIENT (POST-SIGNATURE)
 * Promesse : “Voici le moment exact où un dossier devient irrécupérable.”
 * Argumentaire commercial 30k€ : Preuve moteur & ROI.
 */

interface AutomationEvent {
  day: number;
  type: 'email' | 'alert' | 'escalation';
  label: string;
  impactRate?: number;
}

interface ClientDriftAnalysisProps {
  driftData?: DriftMetrics[];
  automationLogs?: AutomationEvent[];
}

const ThresholdCard = ({ day, label, desc, color }: { day: string, label: string, desc: string, color: string }) => (
    <div className="bg-[#0F1629] border border-white/5 p-8 rounded-3xl flex flex-col gap-4 group transition-all hover:bg-white/[0.02]">
        <div className="flex justify-between items-center">
            <span className="text-sm font-mono font-bold" style={{ color }}>{day}</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        </div>
        <div className="flex flex-col gap-1">
            <span className="text-lg font-black font-manrope text-white">{label}</span>
            <p className="text-[10px] text-white/40 leading-relaxed font-medium uppercase tracking-tight">{desc}</p>
        </div>
    </div>
);

export const ClientDriftAnalysis: React.FC<ClientDriftAnalysisProps> = ({ 
  driftData = [],
  automationLogs = [
    { day: 3, type: 'email', label: 'Relance douce envoyée', impactRate: 72 },
    { day: 7, type: 'email', label: 'Email anti-annulation', impactRate: 48 },
    { day: 10, type: 'alert', label: 'Notification commercial' },
    { day: 14, type: 'escalation', label: 'Dossier marqué "À risque"' },
  ]
}) => {
  return (
    <section className="screen-analysis p-12 bg-[#0A0E27] min-h-screen text-white flex flex-col gap-16 font-sans overflow-x-hidden">
      
      {/* HEADER STRATÉGIQUE */}
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Drift client — Post-Signature</h1>
        <p className="text-white/40 uppercase tracking-[0.4em] text-[10px] font-bold font-mono">
          “Quand l’inaction devient fatale” — Loi du décrochage & Preuve Moteur
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* COLONNE GAUCHE & CENTRE : LOI DU DÉCROCHAGE (A) */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          <div className="bg-[#0F1629] border border-white/5 rounded-3xl p-10 flex flex-col gap-8 shadow-2xl">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase font-bold tracking-[0.3em] text-white/30">A. Loi du décrochage (Volumes €)</span>
                    <h2 className="text-xl font-bold font-manrope">Cinétique de l'irréversibilité</h2>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-widest text-white/20">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#4ADE80]" /> Actifs
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full border border-[#FB923C] border-dashed" /> Silencieux
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#F87171]" /> Refus
                    </div>
                </div>
            </div>

            <div className="h-[360px] w-full bg-[#0A0E27]/50 rounded-2xl border border-white/5 flex items-center justify-center relative overscroll-none">
              <BehaviorDriftTimelineVisx data={driftData} width={800} height={340} />
            </div>

            <p className="text-xs text-white/40 leading-relaxed italic border-l border-white/10 pl-6">
                Le silence précède l'annulation. Entre J+7 et J+14, la probabilité de récupération chute de 62%. 
                Passé J+21, l'effort humain est statistiquement vain sans intervention de l'IA.
            </p>
          </div>

          {/* B. SEUILS CRITIQUES (INTERPRÉTATION MÉTIER) */}
          <div className="grid grid-cols-3 gap-6">
             <ThresholdCard 
                day="J+7" 
                label="48% de silence" 
                desc="Le client bascule en zone de tension. Risque de perte de contact." 
                color="#FB923C" 
             />
             <ThresholdCard 
                day="J+14" 
                label="72% d'annulation" 
                desc="Point de non-retour pour l'humain. Escalade automatique requise." 
                color="#F87171" 
             />
             <ThresholdCard 
                day="J+21" 
                label="<10% récupérables" 
                desc="Dossier en échec terminal. Archivage ou relance désespérée." 
                color="#64748B" 
             />
          </div>
        </div>

        {/* COLONNE DROITE : PREUVE & ROI (C) */}
        <aside className="flex flex-col gap-8">
            {/* ROI MOTEUR (HERO SECONDAIRE) */}
            <div className="p-8 bg-gradient-to-br from-[#10B981]/20 to-[#0A0E27] border border-[#10B981]/30 rounded-3xl flex flex-col gap-6 shadow-xl">
                <span className="text-[10px] uppercase font-black text-[#10B981] tracking-[0.4em]">ROI Moteur (IA)</span>
                <div className="flex flex-col gap-1">
                    <span className="text-5xl font-black font-manrope tracking-tighter text-white">107 000 €</span>
                    <span className="text-xs font-mono text-white/40 uppercase tracking-tight">CA sauvé par l'automatisation</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] w-[68%]" />
                </div>
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-white/20">
                    <span>Efficacité</span>
                    <span>68% de récupération</span>
                </div>
            </div>

            {/* C. PREUVE MOTEUR (JOURNAL) */}
            <div className="bg-[#0F1629] border border-white/5 rounded-3xl p-8 flex flex-col gap-8 flex-1">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold font-manrope uppercase tracking-widest text-white">Preuve Moteur</h3>
                    <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Journal des actions autonomes</p>
                </div>

                <div className="flex flex-col gap-6">
                    {automationLogs.map((log, i) => (
                        <div key={i} className="flex gap-4 items-start group">
                            <div className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono border border-white/10 ${log.type === 'escalation' ? 'bg-[#F87171]/20 text-[#F87171]' : 'bg-white/5 text-white/40'}`}>
                                    {log.day}j
                                </div>
                                {i < automationLogs.length - 1 && <div className="w-[1px] h-6 bg-white/5" />}
                            </div>
                            <div className="flex flex-col gap-1 pt-1">
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${log.type === 'escalation' ? 'text-[#F87171]' : 'text-white/70'}`}>
                                    {log.label}
                                </span>
                                {log.impactRate && (
                                    <span className="text-[10px] font-mono text-[#4ADE80] font-bold">{log.impactRate}% ouverture</span>
                                )}
                                <span className="text-[9px] text-white/20 uppercase tracking-widest font-medium">Auto-déclenché</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
                    <p className="text-[10px] text-white/30 italic leading-relaxed">
                        Le système agit quand les humains oublient. 
                        Aucun dossier ne reste sans signal &gt; 48h.
                    </p>
                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all text-white/60 hover:text-white">
                        Configurer les seuils
                    </button>
                </div>
            </div>
        </aside>

      </div>
    </section>
  );
};
