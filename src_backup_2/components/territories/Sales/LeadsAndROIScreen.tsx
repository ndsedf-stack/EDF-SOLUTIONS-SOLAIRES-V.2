import React, { useMemo } from 'react';
import { DualFlowVisx } from './sections/DualFlowVisx';

interface LeadsAndROIScreenProps {
  system: any;
}

export function LeadsAndROIScreen({ system }: LeadsAndROIScreenProps) {
  const { studies, metrics, emailLeads } = system;

  // 1. DATA: HERO ROI
  const caSaved = studies
    .filter((s: any) => s.was_war_room && s.deposit_paid)
    .reduce((sum: number, s: any) => sum + (s.total_price || 0), 0);

  // 2. DATA: DUAL FLOW (Séries temporelles simulées)
  const dualFlowData = useMemo(() => {
    const points = [];
    const now = new Date();
    for (let i = 30; i >= 0; i -= 5) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      points.push({
        date,
        leads: 10 + Math.floor(Math.random() * 20),
        securedAfterRisk: 20 + Math.floor(Math.random() * 50)
      });
    }
    return points;
  }, []);

  const totalEffortHours = (metrics.stats?.totalEmailsSent || 0) * 0.25;

  return (
    <div className="flex flex-col gap-16 py-12 px-4 max-w-[1200px] mx-auto pb-40">
      
      {/* 1️⃣ HERO ROI */}
      <section className="text-center space-y-4">
         <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em]">ROI SYSTÈME CONFIRMÉ</span>
         <div className="flex flex-col items-center">
            <span className="text-8xl md:text-9xl font-black text-white tracking-tighter leading-none">
                {Math.round(caSaved / 1000).toLocaleString()} k€
            </span>
            <p className="text-2xl font-bold text-white/40 mt-4 h-8">CHIFFRE D'AFFAIRES SÉCURISÉ PAR AUTOPILOTE</p>
         </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 2️⃣ DUAL FLOW VISX */}
        <section className="lg:col-span-8 bg-[#0F1629] p-12 rounded-3xl border border-white/5 space-y-10">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">CRÉATION vs PROTECTION</span>
              <h2 className="text-xl font-black text-white">Où gagne-t-on vraiment de l'argent ?</h2>
           </div>
           <DualFlowVisx data={dualFlowData} />
           <aside className="p-6 bg-white/[0.02] border-l-4 border-emerald-500 rounded-r-xl mt-8">
              <p className="text-xs text-white/60 leading-relaxed font-medium italic">
                "Le système ne se contente pas de traiter les nouveaux leads. Sa valeur principale réside dans sa capacité à empêcher l'érosion du CA signé (Zone Verte)."
              </p>
           </aside>
        </section>

        {/* 3️⃣ CONVERSION VELOCITY & TIME SAVED */}
        <section className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-[#0F1629] p-10 rounded-2xl border border-white/5 space-y-8 flex-1">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Vélocité Commerciale</span>
                <div className="space-y-6">
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Avant Autopilote</span>
                      <span className="text-2xl font-black text-white/40 italic">14.5 Jours</span>
                   </div>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">Actuellement</span>
                      <span className="text-4xl font-black text-emerald-400">11.2 Jours</span>
                   </div>
                   <div className="py-2 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg inline-block">
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">-23% de délai</span>
                   </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-sky-900/40 to-slate-900 p-10 rounded-2xl border border-sky-500/20 flex-1">
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block">Économie de ressources</span>
                <div className="mt-8 space-y-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-6xl font-black text-white">{Math.round(totalEffortHours)}</span>
                        <span className="text-xl font-bold text-white/30 uppercase">Heures</span>
                    </div>
                    <p className="text-sm font-medium text-white/60 leading-relaxed">
                        C'est l'équivalent d'un commercial à temps plein dédié uniquement à la réassurance client.
                    </p>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}
