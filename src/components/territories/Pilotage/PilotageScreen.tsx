import React, { useMemo } from 'react';
import { FinancialVerdictBar } from './sections/FinancialVerdictBar';
import { ClientDriftVisxRefined } from './sections/ClientDriftVisxRefined';
import { PipelineMomentumVisx } from './sections/PipelineMomentumVisx';
import { RevenueProjectionVisx } from './sections/RevenueProjectionVisx';

interface PilotageScreenProps {
  system: any;
}

export function PilotageScreen({ system }: PilotageScreenProps) {
  const { studies, financialStats, emailLeads, metrics } = system;

  // 1. DATA S01: FINANCIAL VERDICT
  const verdictData = useMemo(() => ({
    securedCA: financialStats.cashSecured || 0,
    exposedCA: financialStats.cashAtRisk || 0,
    cancelledCA: financialStats.cashLost || (financialStats.totalPotentialCA * 0.1) || 50000,
  }), [financialStats]);

  // 2. DATA S02: CLIENT DRIFT (SIMULÉ J+0 à J+14)
  const driftData = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      day: i,
      activeRate: Math.max(20, 100 - (i * 5) - (i > 7 ? (i-7) * 8 : 0)), // Décrochage accentué après J+7
    }));
  }, []);

  // 3. DATA S03: PIPELINE MOMENTUM
  const pipelineData = useMemo(() => [
    { stage: 'Leads', count: emailLeads?.length || 0, color: '#94A3B8' },
    { stage: 'RDVs/Études', count: studies?.length || 0, color: '#38BDF8' },
    { stage: 'Signés', count: studies?.filter((s:any) => s.status === 'signed').length || 0, color: '#FB923C' },
    { stage: 'Acomptes', count: studies?.filter((s:any) => s.deposit_paid).length || 0, color: '#4ADE80' },
  ], [emailLeads, studies]);

  // 4. DATA S04: REVENUE PROJECTION (90J)
  const projectionData = useMemo(() => {
    const points = [];
    const now = new Date();
    const target = (financialStats.cashSecured || 500000) * 1.5;
    
    for (let i = 0; i <= 90; i += 10) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      points.push({
        date,
        secured: financialStats.cashSecured || 100000,
        projected: (financialStats.cashSecured || 100000) + (i * 2000),
        target: target
      });
    }
    return points;
  }, [financialStats]);

  return (
    <div className="flex flex-col gap-12 py-8 px-4 max-w-[1200px] mx-auto pb-40">
      
      <header className="flex flex-col gap-2">
         <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Salle de Navigation</h1>
         <p className="text-white/40 text-sm font-black uppercase tracking-[0.4em]">Vision Dirigeant & Trajectoire Stratégique</p>
      </header>

      {/* S01 — FINANCIAL VERDICT */}
      <section className="bg-[#0F1629] p-12 rounded-3xl border border-white/5 space-y-10">
        <div className="flex justify-between items-end">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">S01 — VERDICT DE TRÉSORERIE</span>
              <h2 className="text-2xl font-black text-white">Quelle part du CA est réellement protégée ?</h2>
           </div>
           <div className="text-right">
              <span className="text-3xl font-black text-emerald-400">{(financialStats.cashSecured || 0).toLocaleString()} €</span>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block font-mono">CASH SÉCURISÉ</span>
           </div>
        </div>
        <FinancialVerdictBar data={verdictData} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* S02 — CLIENT DRIFT */}
        <section className="bg-[#0F1629] p-12 rounded-3xl border border-white/5 space-y-8">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">S02 — DÉCROCHAGE CLIENT</span>
              <h2 className="text-xl font-black text-white">Quand exactement les clients décrochent-ils ?</h2>
           </div>
           <ClientDriftVisxRefined data={driftData} />
           <p className="text-[11px] text-white/30 italic font-medium leading-relaxed">
              "70% des annulations se préparent dans le silence entre J+3 et J+14. Le système intervient avant le point de rupture."
           </p>
        </section>

        {/* S03 — PIPELINE MOMENTUM */}
        <section className="bg-[#0F1629] p-12 rounded-3xl border border-white/5 space-y-8">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">S03 — PIPELINE MOMENTUM</span>
              <h2 className="text-xl font-black text-white">Où ça bloque dans mon flux commercial ?</h2>
           </div>
           <PipelineMomentumVisx data={pipelineData} />
        </section>

      </div>

      {/* S04 — REVENUE PROJECTION */}
      <section className="bg-[#0F1629] p-12 rounded-3xl border border-white/5 space-y-10">
        <div className="flex justify-between items-end">
           <div className="space-y-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">S04 — ATTERRISSAGE 90 JOURS</span>
              <h2 className="text-2xl font-black text-white">Si je ne change rien, où j'atterris ?</h2>
           </div>
           <div className="text-right">
              <span className="text-3xl font-black text-sky-400">-{Math.round(((financialStats.cashSecured || 500000) * 1.5 - (financialStats.cashSecured || 100000 + 180000)) / 1000)}k€</span>
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block font-mono">GAP vs OBJECTIF</span>
           </div>
        </div>
        <RevenueProjectionVisx data={projectionData} />
      </section>

    </div>
  );
}
