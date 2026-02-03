import React, { useMemo } from 'react';
import { FinancialRiskProofVisx, FinancialPoint } from './core/FinancialRiskProofVisx';
import { SystemActivityFeed, ActivityEvent } from './core/SystemActivityFeed';

interface CockpitScreenProps {
  system: any;
}

export function CockpitScreen({ system }: CockpitScreenProps) {
  const { studies, metrics, financialStats, logs } = system;

  // 1. CALCUL DE L'ÉTAT GLOBAL (BRAIN)
  const totalCA = financialStats.totalCA || studies.reduce((sum: number, s: any) => sum + (s.total_price || 0), 0);
  const exposedCA = financialStats.cashAtRisk || 0;
  const exposureRatio = totalCA > 0 ? exposedCA / totalCA : 0;

  const systemState = useMemo(() => {
    if (exposureRatio < 0.2) return 'stable';
    if (exposureRatio < 0.35) return 'tension';
    return 'critical';
  }, [exposureRatio]);

  // 2. MAPPING DES DONNÉES FINANCIÈRES (30 JOURS)
  const financialRiskData: FinancialPoint[] = useMemo(() => {
    const days = Array.from({ length: 30 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });

    return days.map(dayStr => {
      // On prend tout ce qui a été créé AVANT ce jour
      const studiesExistingAtDate = studies.filter((s: any) => s.created_at <= dayStr);
      
      const dayDate = new Date(dayStr);
      dayDate.setHours(23, 59, 59, 999); // Fin de journée pour comparaison inclusive

      let secured = 0;
      let exposed = 0;

      studiesExistingAtDate.forEach((s: any) => {
         // Un dossier est 'signé' si son signed_at est <= date (ou s'il est signed sans date - fallback)
         // NOTE: Si pas de signed_at, on suppose created_at pour simplifier ou on ignore.
         // Ici on garde la logique "status === signed" actuelle mais on pourrait affiner.
         
         const isSigned = s.status === 'signed'; // Idéalement vérifier s.signed_at <= dayStr
         if (!isSigned) return;

         // Est-il sécurisé À CETTE DATE ?
         // Il faut qu'il ait payé l'acompte ET que la date de paiement soit <= date du jour
         const paidAt = s.deposit_paid_at ? new Date(s.deposit_paid_at) : null;
         const isSecuredAtDate = s.deposit_paid && paidAt && paidAt <= dayDate;

         if (isSecuredAtDate) {
           secured += (s.total_price || 0);
         } else {
           exposed += (s.total_price || 0);
         }
      });

      return { date: dayStr, securedCA: secured, exposedCA: exposed };
    });
  }, [studies]);

  // 3. MAPPING ACTIVITY FEED (SIMULÉ / LOGS RÉELS)
  const activityFeed: ActivityEvent[] = useMemo(() => {
    // On extrait les derniers logs significatifs
    const recentLogs = (logs || []).slice(0, 10).map((l: any) => ({
      id: l.id,
      type: l.event_type === 'email_sent' ? 'email_sent' : 'decision',
      label: l.title || 'Action Système',
      time: new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      detail: l.description || '',
    }));
    return recentLogs;
  }, [logs]);

  return (
    <div className="flex flex-col gap-12 py-8 px-4 max-w-[1200px] mx-auto pb-40">
      
      {/* 1️⃣ GLOBAL STATUS BANNER */}
      <header className={`p-10 rounded-3xl border transition-all flex items-center justify-between ${
          systemState === 'stable' ? 'bg-emerald-500/5 border-emerald-500/20' :
          systemState === 'tension' ? 'bg-orange-500/5 border-orange-500/20' :
          'bg-red-500/10 border-red-500/30'
      }`}>
        <div className="flex items-center gap-8">
           <div className={`w-4 h-4 rounded-full animate-pulse ${
             systemState === 'stable' ? 'bg-emerald-500' :
             systemState === 'tension' ? 'bg-orange-500' : 'bg-red-500'
           }`} />
           <div className="space-y-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">ÉTAT SYSTÈME</span>
              <h1 className={`text-4xl font-black uppercase tracking-tighter ${
                systemState === 'stable' ? 'text-emerald-400' :
                systemState === 'tension' ? 'text-orange-400' : 'text-red-500'
              }`}>
                {systemState === 'stable' && 'SYSTÈME STABILISÉ'}
                {systemState === 'tension' && 'ZONE DE TENSION'}
                {systemState === 'critical' && 'SITUATION CRITIQUE'}
              </h1>
           </div>
        </div>
        <div className="text-right">
           <span className="text-3xl font-black text-white tracking-tighter">{Math.round(exposureRatio * 100)}%</span>
           <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest block">Du CA exposé</span>
        </div>
      </header>

      {/* 2️⃣ FINANCIAL RISK PROOF (Graphe HERO) */}
      <div className="bg-[#0F1629] p-12 rounded-3xl border border-white/5 space-y-8">
        <div>
           <h2 className="text-xl font-black text-white uppercase tracking-widest">Protection du Chiffre d’Affaires</h2>
           <p className="text-white/40 text-sm font-medium italic">"Vérité absolue sur la dérive entre CA sécurisé et CA à risque (30j)."</p>
        </div>
        <FinancialRiskProofVisx data={financialRiskData} />
      </div>

      {/* 3️⃣ KPI STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <KPICard label="Dossiers War Room" value={metrics.warRoom.count} />
         <KPICard label="CA Exposé" value={`${Math.round(exposedCA / 1000)}k€`} />
         <KPICard label="Délai moyen deadline" value={`${metrics.avgDaysBeforeDeadline || 14} j`} />
      </div>

      {/* 4️⃣ ACTIVITY FEED */}
      <div className="bg-[#0F1629] p-12 rounded-3xl border border-white/5 space-y-8">
          <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.4em]">Preuve d'activité (Moteur Brain)</h3>
          <SystemActivityFeed events={activityFeed} />
      </div>

      {/* 5️⃣ CTA WAR ROOM */}
      {metrics.warRoom.count > 0 && (
         <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
            <button 
              onClick={() => system.setActiveSection('war_room')}
              className="px-12 py-5 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.4em] text-xs rounded-2xl shadow-[0_20px_50px_rgba(220,38,38,0.4)] transition-all active:scale-95"
            >
              Entrer en War Room ({metrics.warRoom.count})
            </button>
         </div>
      )}
    </div>
  );
}

const KPICard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-white/[0.02] p-8 rounded-3xl border border-white/5 flex flex-col gap-2">
     <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</span>
     <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
  </div>
);
