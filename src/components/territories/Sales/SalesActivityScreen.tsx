import React, { useMemo } from 'react';
import { ConversionFlowVisx } from './sections/ConversionFlowVisx';
import { MonthlyRevenueVisx } from './sections/MonthlyRevenueVisx';

interface SalesActivityScreenProps {
  system: any;
}

export function SalesActivityScreen({ system }: SalesActivityScreenProps) {
  const { studies, metrics, financialStats } = system;

  // 1. DATA: CONVERSION FLOW
  const conversionData = useMemo(() => [
    { step: 'Études envoyées', value: studies.length, color: '#94A3B8' },
    { step: 'Ouvertures', value: studies.filter((s:any) => s.views > 0).length, color: '#38BDF8' },
    { step: 'Clis', value: studies.filter((s:any) => s.clicks > 0).length, color: '#6366F1' },
    { step: 'Signées', value: studies.filter((s:any) => s.status === 'signed').length, color: '#FB923C' },
  ], [studies]);

  // 2. DATA: MONTHLY REVENUE (Simulé pour la démo)
  const revenueData = useMemo(() => [
    { month: 'Sept', revenue: 450000 },
    { month: 'Oct', revenue: 480000 },
    { month: 'Nov', revenue: 420000 },
    { month: 'Déc', revenue: 580000 },
    { month: 'Jan', revenue: 720000 },
    { month: 'Fév', revenue: 850000 },
  ], []);

  const totalEffortHours = (metrics.stats?.totalEmailsSent || 0) * 0.25;

  return (
    <div className="flex flex-col gap-12 py-8 px-4 max-w-[1200px] mx-auto pb-40">
      
      <header className="flex flex-col gap-2">
         <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Vente & Conversion</h1>
         <p className="text-white/40 text-sm font-black uppercase tracking-[0.4em]">Efficacité et Vitesse de Croisière Commerciale</p>
      </header>

      {/* 1️⃣ SALES KPI HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <KPICard label="Études Créées" value={studies.length} detail="+12% vs mois dernier" />
         <KPICard label="Taux de Signature" value={`${Math.round((studies.filter((s:any) => s.status === 'signed').length / studies.length) * 100)}%`} detail="Stable" />
         <KPICard label="Cycle Moyen" value="11 j" detail="-2.4 j avec Autopilote" />
         <KPICard label="Panier Moyen" value={`${Math.round((studies.length > 0 ? financialStats.totalPotentialCA / studies.length : 0) / 1000)}k€`} detail="Stable" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 2️⃣ CONVERSION FLOW */}
        <section className="lg:col-span-12 bg-[#0F1629] p-12 rounded-3xl border border-white/5 space-y-10">
           <div className="flex items-end justify-between">
              <div className="space-y-1">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">ANALYSE DE CONVERSION</span>
                 <h2 className="text-xl font-black text-white">Est-ce que les études servent vraiment à closer ?</h2>
              </div>
              <div className="text-right">
                  <span className="text-3xl font-black text-white">{Math.round((studies.filter((s:any) => s.status === 'signed').length / studies.filter((s:any) => s.views > 0).length) * 100)}%</span>
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block">Ouverture → Signature</span>
              </div>
           </div>
           <ConversionFlowVisx data={conversionData} />
        </section>

        {/* 3️⃣ MONTHLY REVENUE */}
        <section className="lg:col-span-8 bg-[#0F1629] p-12 rounded-3xl border border-white/5 space-y-10">
            <div className="space-y-1">
               <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">MOMENTUM FINANCIER</span>
               <h2 className="text-xl font-black text-white">Est-ce que je vends plus qu'avant ?</h2>
            </div>
            <MonthlyRevenueVisx data={revenueData} />
        </section>

        {/* 4️⃣ EFFICIENCY PROOF */}
        <section className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-8 rounded-3xl border border-indigo-500/20 flex-1 flex flex-col justify-center gap-6">
               <div className="space-y-1">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Temps Économisé</span>
                  <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-black text-white">{Math.round(totalEffortHours)}</span>
                     <span className="text-xl font-bold text-white/30">H</span>
                  </div>
                  <p className="text-[11px] text-indigo-300/40 font-medium italic mt-2">"Équivalent à 32 nouveaux RDVs de découverte par mois."</p>
               </div>
               
               <div className="h-px bg-white/5" />

               <div className="space-y-1">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">CA Sauvé (War Room)</span>
                  <div className="flex items-baseline gap-2">
                     <span className="text-5xl font-black text-white">{Math.round(metrics.warRoom.ca / 1000)}</span>
                     <span className="text-xl font-bold text-white/30">k€</span>
                  </div>
                  <p className="text-[11px] text-emerald-300/40 font-medium italic mt-2">"Signature protégée par le système brain."</p>
               </div>
            </div>
        </section>

      </div>
    </div>
  );
}

const KPICard = ({ label, value, detail }: { label: string; value: string | number; detail: string }) => (
  <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 flex flex-col gap-2">
     <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">{label}</span>
     <span className="text-3xl font-black text-white tracking-tighter">{value}</span>
     <span className="text-[10px] font-bold text-emerald-500/40 uppercase tracking-widest">{detail}</span>
  </div>
);
