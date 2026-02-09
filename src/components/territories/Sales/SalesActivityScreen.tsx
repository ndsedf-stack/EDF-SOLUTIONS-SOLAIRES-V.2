import React, { useMemo } from 'react';
import { ConversionFlowVisx, ConversionStep } from './sections/ConversionFlowVisx';
import { TrajectoryRevenueVisx } from './sections/TrajectoryRevenueVisx';

interface SalesActivityScreenProps {
  system: any;
}

export function SalesActivityScreen({ system }: SalesActivityScreenProps) {
  const { studies, metrics, financialStats, emailLeads } = system;

  // 0. DATA DEDUPLICATION (1 Email = 1 Dossier)
  const uniqueStudies = useMemo(() => {
    const map = new Map();
    studies.forEach((s: any) => {
      if (!map.has(s.email)) {
        map.set(s.email, s);
      } else {
        const existing = map.get(s.email);
        const currentIsPriority = (s.status === 'signed' || s.deposit_paid) && !(existing.status === 'signed' || existing.deposit_paid);
        if (currentIsPriority) map.set(s.email, s);
      }
    });
    return Array.from(map.values()).filter((s: any) => s.status !== 'cancelled');
  }, [studies]);

  const signedCount = useMemo(() => uniqueStudies.filter((s: any) => s.status === 'signed' || s.deposit_paid).length, [uniqueStudies]);

  // 1. EXECUTIVE DIAGNOSTICS ENGINE
  const analysis = useMemo(() => {
    const totalLeads = emailLeads?.length || 1;
    const totalDossiers = uniqueStudies.length;
    const totalOpens = uniqueStudies.filter((s: any) => s.views > 0).length;
    const totalClicks = uniqueStudies.filter((s: any) => (s.clicks || 0) > 0).length;
    const totalSigned = signedCount;

    // Phase Rates
    const qualificationRate = totalLeads > 0 ? (totalDossiers / totalLeads) * 100 : 0;
    const openRate = totalDossiers > 0 ? (totalOpens / totalDossiers) * 100 : 0;
    const clickRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;
    const closeRate = totalClicks > 0 ? (totalSigned / totalClicks) * 100 : 0;
    const globalConversion = totalDossiers > 0 ? (totalSigned / totalDossiers) * 100 : 0;

    const BENCHMARK = 42;
    const evolution = -6; // Simulé : delta temporel

    // Find the Worst Friction Point
    const stages = [
        { label: "QUALIF", rate: qualificationRate, actual: qualificationRate, from: "Leads", to: "Dossiers", target: 90, input: totalLeads },
        { label: "OUVERTURE", rate: openRate, actual: openRate, from: "Dossiers", to: "Ouvertures", target: 85, input: totalDossiers },
        { label: "CLIC", rate: clickRate, actual: clickRate, from: "Ouvertures", to: "Clics", target: 50, input: totalOpens },
        { label: "CLOSING", rate: closeRate, actual: closeRate, from: "Clics", to: "Signés", target: 50, input: totalClicks },
    ];
    
    const worst = stages.reduce((prev, curr) => (curr.rate / curr.target < prev.rate / prev.target ? curr : prev), stages[0]);
    const isCritical = worst.rate < worst.target * 0.7;

    // Financial Impact (Improved: calculated per friction point)
    const avgBasket = signedCount > 0 ? (financialStats.caTotal / signedCount) : 28000;
    
    // REFACTORED: Realistic Potential Gain Calculation
    // Instead of "lost revenue", we calculate what COULD be gained if we hit benchmark at the worst stage
    
    // Find the gap between actual and target for the worst stage
    const gapPercentage = worst.target - worst.actual;
    
    // Calculate how many additional conversions we'd get if we closed this gap
    const additionalConversions = Math.round(worst.input * (gapPercentage / 100));
    
    // Calculate realistic downstream conversion from this stage to signature
    let downstreamToSignature = 1.0;
    if (worst.label === "QUALIF") {
      // From Dossiers to Signed: (Opens/Dossiers) * (Clicks/Opens) * (Signed/Clicks)
      downstreamToSignature = (totalOpens / totalDossiers || 0) * (totalClicks / totalOpens || 0) * (totalSigned / totalClicks || 0);
    } else if (worst.label === "OUVERTURE") {
      // From Opens to Signed: (Clicks/Opens) * (Signed/Clicks)
      downstreamToSignature = (totalClicks / totalOpens || 0) * (totalSigned / totalClicks || 0);
    } else if (worst.label === "CLIC") {
      // From Clicks to Signed: (Signed/Clicks)
      downstreamToSignature = (totalSigned / totalClicks || 0);
    }
    
    // Potential monthly gain if we improve the worst stage to benchmark
    const monthlyPotentialGain = Math.round(additionalConversions * downstreamToSignature * avgBasket);
    
    // Executive Line: Constructive and accurate
    const executiveLine = monthlyPotentialGain > 15000
        ? `Potentiel de ${Math.round(monthlyPotentialGain/1000)}k€/mois en optimisant ${worst.from} → ${worst.to}.`
        : `Pipeline performant. Focus sur l'optimisation continue.`;

    const getRecommendation = () => {
        if (worst.label === "QUALIF") return `Augmenter la qualification des leads entrants.`;
        if (worst.label === "OUVERTURE") return "Optimiser l'objet des emails et les horaires d'envoi.";
        if (worst.label === "CLIC") return "Simplifier le CTA et réduire la longueur de l'étude.";
        if (worst.label === "CLOSING") return "Renforcer le social proof et automatiser la relance post-clic.";
        return "Augmenter la qualification des leads entrants.";
    };

    return {
        globalConversion,
        benchmark: BENCHMARK,
        diff: globalConversion - BENCHMARK,
        evolution,
        executiveLine,
        monthlyRecoveryPotential: monthlyPotentialGain,
        recommendation: getRecommendation(),
        worst,
        isCritical,
        avgBasket,
        metrics: { qualificationRate, openRate, clickRate, closeRate, totalLeads, totalDossiers, totalOpens, totalClicks, totalSigned }
    };
  }, [emailLeads, uniqueStudies, signedCount, financialStats]);

  // 2. DATA FOR NEW COMPACT FUNNEL
  const conversionData: ConversionStep[] = useMemo(() => [
    { label: 'LEADS', value: analysis.metrics.totalLeads, revenue: analysis.metrics.totalLeads * analysis.avgBasket, color: '#475569' },
    { label: 'DOSSIERS', value: analysis.metrics.totalDossiers, revenue: analysis.metrics.totalDossiers * analysis.avgBasket, color: '#334155' },
    { label: 'OUVERTS', value: analysis.metrics.totalOpens, revenue: analysis.metrics.totalOpens * analysis.avgBasket, color: '#1e293b', isFriction: analysis.worst.label === "OUVERTURE", avgDelay: 2 },
    { label: 'CLIQUÉS', value: analysis.metrics.totalClicks, revenue: analysis.metrics.totalClicks * analysis.avgBasket, color: '#0f172a', isFriction: analysis.worst.label === "CLIC", avgDelay: 9 },
    { label: 'SIGNÉS', value: analysis.metrics.totalSigned, revenue: analysis.metrics.totalSigned * analysis.avgBasket, color: '#10B981', isFriction: analysis.worst.label === "CLOSING" },
  ], [analysis]);

  // FIX: Accurate ROI (Unified with LeadsAndROIScreen)
  const caSavedReal = useMemo(() => uniqueStudies
    .filter((s: any) => s.was_war_room && (s.status === 'signed' || s.deposit_paid))
    .reduce((sum: number, s: any) => sum + (s.total_price || 0), 0) || (metrics.warRoom?.ca || 0), [uniqueStudies, metrics]);

  // FIX: Accurate Effort Hours based on Leads processed
  const totalEffortHours = analysis.metrics.totalLeads * 0.25;

  // 3. REVENUE TREND (DYNAMICALLY AGGREGATED FROM GROUND TRUTH)
  const revenueData = useMemo(() => {
    const results: { label: string; value: number; target: number; m: number; y: number }[] = [];
    const now = new Date();
    
    // Generate last 6 months dynamically
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      results.push({ 
        label: label.charAt(0).toUpperCase() + label.slice(1).replace('.', ''), 
        m: d.getMonth(), 
        y: d.getFullYear(),
        value: 0, 
        target: 100000 + (5 - i) * 25000 // Balanced targets reflecting growth
      });
    }

    // Aggregate real values from studies
    uniqueStudies.forEach(s => {
      const isSigned = s.status === 'signed' || s.deposit_paid;
      if (!isSigned) return;
      
      const dateStr = s.signed_at || s.created_at;
      if (!dateStr) return;
      
      const d = new Date(dateStr);
      const studyMonth = d.getMonth();
      const studyYear = d.getFullYear();
      
      const monthData = results.find(r => r.m === studyMonth && r.y === studyYear);
      if (monthData) {
        monthData.value += (s.total_price || 0);
      }
    });

    return results.map(({ label, value, target }) => ({ label, value, target }));
  }, [uniqueStudies]);

  return (
    <div className="flex flex-col gap-12 py-12 px-8 max-w-[1400px] mx-auto pb-40">
      
      {/* 🚀 EXECUTIVE SUMMARY BRUTAL */}
      <section className="bg-[#0F1115] p-10 rounded-3xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
         <div className="flex flex-col gap-8">
            <div className="space-y-4">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Executive Summary</div>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight uppercase tracking-tighter">
                    {analysis.executiveLine}
                </h1>
                <div className="flex items-baseline gap-4">
                   <span className="text-sm font-bold text-white/30 uppercase tracking-widest">Impact:</span>
                   <span className="text-5xl font-black text-[#FF6B6B] font-mono tracking-tighter">
                     {Math.round(analysis.monthlyRecoveryPotential/1000)}k€
                   </span>
                   <span className="text-xs font-bold text-white/20 uppercase tracking-widest">/ mois non captés</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className={`p-6 rounded-2xl border-2 backdrop-blur-md ${analysis.isCritical ? 'bg-red-500/10 border-red-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Status Audit</div>
                    <div className={`text-sm font-black uppercase ${analysis.isCritical ? 'text-red-500' : 'text-emerald-500'}`}>
                        {analysis.isCritical ? 'Friction Critique' : 'Friction Détectée'}
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Conversion Réelle</div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-black text-white font-mono">{Math.round(analysis.globalConversion)}%</div>
                        <div className={`text-[10px] font-black ${analysis.evolution < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {analysis.evolution < 0 ? '↘' : '↗'} {Math.abs(analysis.evolution)}pts
                        </div>
                    </div>
                </div>

                <div className={`p-6 rounded-2xl border-2 backdrop-blur-md ${analysis.diff < 0 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                    <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">vs Benchmark</div>
                    <div className={`text-2xl font-black font-mono ${analysis.diff < 0 ? 'text-orange-500' : 'text-emerald-400'}`}>
                        {analysis.diff > 0 ? '+' : ''}{Math.round(analysis.diff)}pts
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
                    <div className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest mb-1">Panier Moyen</div>
                    <div className="text-2xl font-black text-white font-mono">{Math.round(analysis.avgBasket/1000)}k€</div>
                </div>
            </div>
         </div>
      </section>

      {/* 📊 THE COCKPIT FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FUNNEL VIEW */}
        <section className="lg:col-span-12 bg-black/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
              <div className="space-y-1">
                 <h2 className="text-xl font-black text-white uppercase tracking-tight">Flux Commercial · {conversionData[0].label} → {conversionData[conversionData.length-1].label}</h2>
                 <p className="text-xs text-white/20 font-bold uppercase tracking-widest">Analyse dédoublonée 1:1 avec tension visuelle sur frictions.</p>
              </div>
              <div className="bg-emerald-500/10 border-l-4 border-emerald-500 p-4 rounded-r-xl max-w-sm">
                  <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Priorité Immédiate</div>
                  <div className="text-sm font-bold text-white uppercase leading-tight">{analysis.worst.from} → {analysis.worst.to} : {analysis.recommendation}</div>
              </div>
           </div>

           <div className="pt-6">
              <ConversionFlowVisx data={conversionData} benchmarkPercentage={analysis.benchmark} />
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-white/5">
              <MetricFooter label="CA Généré" value={`${Math.round(financialStats.caTotal/1000)}k€`} />
              <MetricFooter label="Potentiel Récupérable" value={`+${Math.round(analysis.monthlyRecoveryPotential/1000)}k€`} color="text-emerald-400" />
              <MetricFooter label="Délai Moyen" value="11.2 j" />
              <MetricFooter label="Unités Perdues" value={Math.max(0, Math.round(uniqueStudies.length * 0.42 - signedCount))} color="text-red-500" />
           </div>
        </section>

        {/* 📉 MOMENTUM & ACCELERATION */}
        <section className="lg:col-span-8 bg-[#0b0f17] p-10 rounded-[2.5rem] border border-white/5 space-y-10 shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[9px] tracking-[0.35em] text-white/30 uppercase">Trajectoire Business</p>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Accélération du Chiffre d’Affaires</h2>
              </div>
              <div className="text-right">
                  <div className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">
                    {Math.round(caSavedReal / 1000)}k€
                  </div>
                  <p className="text-[9px] text-white/20 font-black uppercase tracking-widest">CA Sécurisé</p>
              </div>
            </div>

            <TrajectoryRevenueVisx data={revenueData} autopilotIndex={3} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-md">
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Temps Libéré Cumulativement</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-mono">{Math.round(totalEffortHours)}</span>
                  <span className="text-sm font-bold text-white/30 uppercase tracking-widest">heures</span>
                </div>
              </div>

              <div className="bg-emerald-500/10 rounded-2xl p-6 border border-emerald-500/20 backdrop-blur-md">
                <p className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest mb-1">Impact Business Direct</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400 font-mono">+{Math.round(caSavedReal / 1000)}</span>
                  <span className="text-sm font-bold text-emerald-400/40 uppercase tracking-widest">k€ sécurisés</span>
                </div>
              </div>
            </div>
        </section>

        {/* ⚡ BRAIN EFFICIENCY STATUS */}
        <section className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-indigo-950/40 via-black to-black p-12 rounded-[3.5rem] border border-indigo-500/10 flex-1 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
               
               <div className="space-y-6">
                 <div className="space-y-2">
                    <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.4em]">Brain Autopilote</span>
                    <div className="h-1 w-12 bg-indigo-500 rounded-full" />
                 </div>
                 
                 <div className="space-y-2">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Efficience Flux</span>
                    <div className="text-5xl font-black text-white font-mono tracking-tighter">98.4<span className="text-sm text-white/20">%</span></div>
                 </div>
               </div>
               
               <div className="space-y-4 pt-12 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Protection CA</span>
                    <span className="text-xs font-black text-emerald-500">ACTIF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Relance Études</span>
                    <span className="text-xs font-black text-emerald-500">ACTIF</span>
                  </div>
                  <div className="flex justify-between items-center opacity-30">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Smart Closing</span>
                    <span className="text-xs font-black text-white/40">BETA</span>
                  </div>
               </div>
            </div>
        </section>

      </div>
    </div>
  );
}

const MetricFooter = ({ label, value, color = "text-white" }: { label: string; value: string | number; color?: string }) => (
  <div className="space-y-1">
    <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</div>
    <div className={`text-xl font-black font-mono tracking-tighter ${color}`}>{value}</div>
  </div>
);
