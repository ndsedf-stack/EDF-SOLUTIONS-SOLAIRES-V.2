
import React, { useState, useMemo } from 'react';
import { FinancialStats, Study } from '@/brain/types';
import { GrowthCockpit } from "@/components/GrowthCockpit";
import { formatCurrency, formatPercentage } from './utils';

interface FinancialStatsProps {
  stats: FinancialStats;
  studies: Study[];
  onMarkDepositPaid: (id: string, name: string) => void;
  onMarkRibSent: (id: string, name: string) => void;
  onCancelStudy: (id: string, name: string) => void;
  onDeleteStudy: (id: string, name: string) => void;
}

export const FinancialStatsPanel: React.FC<FinancialStatsProps> = ({
  stats,
  studies,
  onMarkDepositPaid,
  onMarkRibSent,
  onCancelStudy,
  onDeleteStudy,
}) => {
  const [activeMetric, setActiveMetric] = useState<"secured" | "waiting" | "cancellable" | "all">("all");
  const caTotal = stats.caTotal || 0;
  const cashSecured = stats.cashSecured || 0;
  const securedCount = stats.securedCount || 0;
  const cashWaitingDeposit = stats.cashWaitingDeposit || 0;
  const waitingDepositCount = stats.waitingDepositCount || 0;
  const cashCancellable = stats.cashCancellable || 0;
  const cancellableCount = stats.cancellableCount || 0;
  const tauxConversion = stats.tauxConversion || 0;

  // ✅ PRÉPARATION DES DONNÉES POUR LE GRAPHIQUE D'AIRE (CUMULATIVE STATE LOGIC)
  const chartData = useMemo(() => {
    // 1. On ne garde que les études signées avec une date de signature
    const signedWithDate = studies
      .filter(s => s.status === 'signed' && s.signed_at)
      .sort((a, b) => new Date(a.signed_at!).getTime() - new Date(b.signed_at!).getTime());

    if (signedWithDate.length === 0) return [];

    let cumSecured = 0;
    let cumWaiting = 0;
    let cumCancellable = 0;

    // 2. Grouper par date mais garder le cumulétif
    const dataPoints: any[] = [];
    
    signedWithDate.forEach(s => {
      const price = s.total_price || 0;
      
      // Catégorisation identique à finance.ts
      if (s.contract_secured) {
        cumSecured += price;
      } else if (!s.deposit_paid && s.has_deposit) {
        cumWaiting += price; // ✅ CORRECTION: Utiliser le prix total, pas 1500
      } else {
        // Cancellable ou autre
        cumCancellable += price;
      }

      dataPoints.push({
        date: new Date(s.signed_at!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        fullDate: s.signed_at,
        secured: cumSecured,
        waiting: cumWaiting,
        cancellable: cumCancellable
      });
    });

    // 3. Unifier par jour pour éviter les surcharges de points sur la même date (X-Axis clarity)
    const dailyMap = new Map<string, any>();
    dataPoints.forEach(pt => {
      dailyMap.set(pt.date, pt); // Le dernier point de la journée contient le cumul final du jour
    });

    return Array.from(dailyMap.values());
  }, [studies]);

  // ✅ MAPPING POUR GROWTH COCKPIT
  const growthData = useMemo(() => {
    return chartData.map(d => ({
      date: d.fullDate || new Date().toISOString(),
      secured: d.secured, // Courbe Héro (Bleu) = Sécurisé
      in_progress: d.waiting + d.cancellable   // Courbe Secondaire (Vert) = En cours (Attente + Annulable)
    }));
  }, [chartData]);


  return (
    <div className="mb-8">
      <div className="mb-12">
        <GrowthCockpit 
          data={growthData} 
          objective={400000} 
          totalSalesCount={securedCount + waitingDepositCount + cancellableCount} 
        />
      </div>

      {/* Titre section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💰</span>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              SITUATION FINANCIÈRE
            </h2>
            <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">
              Analyse des risques et sécurisations
            </div>
          </div>
        </div>
        
        {/* Taux de conversion global */}
        <div className="glass-panel px-4 py-2 rounded-xl border border-white/10">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
            Taux Conversion
          </div>
          <div className="text-2xl font-black text-blue-400">
            {formatPercentage(tauxConversion)}
          </div>
        </div>
      </div>

      {/* Grid 4 cartes compactes */}
      <div className="grid grid-cols-4 gap-4">
        
        {/* CARTE 1 : CA Réalisé (Total Signé) */}
        <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent backdrop-blur-xl hover:border-blue-400/40 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          
          <div className="relative p-4">
            <div className="text-[10px] font-bold text-blue-400/80 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>📊</span> CA Réalisé
            </div>
            <div className="text-4xl font-black mb-1 tracking-tighter bg-gradient-to-br from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
              {formatCurrency(caTotal)}
            </div>
            <div className="text-xs text-slate-400">
              Total signatures
            </div>
          </div>
        </div>

        {/* CARTE 2 : CA Sécurisé (Délai + Acompte) */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent backdrop-blur-xl hover:border-emerald-400/40 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          
          <div className="relative p-4">
            <div className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>🛡️</span> CA Sécurisé
            </div>
            <div className="text-4xl font-black mb-1 tracking-tighter bg-gradient-to-br from-white via-emerald-100 to-emerald-400 bg-clip-text text-transparent">
              {formatCurrency(cashSecured)}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>{securedCount} contrats</span>
              <span className="text-emerald-400/70">Hors délai</span>
            </div>
          </div>
        </div>

        {/* CARTE 3 : Acomptes en Attente */}
        <div className="relative overflow-hidden rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent backdrop-blur-xl hover:border-orange-400/40 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
          
          <div className="relative p-4">
            <div className="text-[10px] font-bold text-orange-400/80 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>⏳</span> Acomptes Attente
            </div>
            <div className="text-4xl font-black mb-1 tracking-tighter bg-gradient-to-br from-white via-orange-100 to-orange-400 bg-clip-text text-transparent">
              {formatCurrency(cashWaitingDeposit)}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>{waitingDepositCount} dossiers</span>
              <span className="text-orange-400/70">Action requise</span>
            </div>
          </div>
        </div>

        {/* CARTE 4 : CA Annulable */}
        <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-transparent to-transparent backdrop-blur-xl hover:border-red-400/40 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all"></div>
          
          <div className="relative p-4">
            <div className="text-[10px] font-bold text-red-400/80 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>⚠️</span> CA Annulable
            </div>
            <div className="text-4xl font-black mb-1 tracking-tighter bg-gradient-to-br from-white via-red-100 to-red-400 bg-clip-text text-transparent">
              {formatCurrency(cashCancellable)}
            </div>
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>{cancellableCount} dossiers</span>
              <span className="text-red-400/70">&lt; 14 jours</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
