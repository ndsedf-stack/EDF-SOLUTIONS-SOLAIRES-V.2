import React from 'react';
import { FinancialRiskProofVisx, RiskBarDatum } from '../core/FinancialRiskProofVisx';

/**
 * 🔴 ÉCRAN 1 — COCKPIT DE VERDICT (AUTORITÉ)
 * Cet écran impose le verdict financier. Pas de bruit, pas de séduction.
 */

interface FinancialRiskVerdictProps {
  status: 'stable' | 'tension' | 'critical';
  secured: number;
  waiting: number;
  cancellable: number;
  threshold: number;
  count: number;
  proofData?: RiskBarDatum[];
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

export const FinancialRiskVerdict: React.FC<FinancialRiskVerdictProps> = ({ 
  status, 
  secured, 
  waiting, 
  cancellable, 
  threshold,
  count,
  proofData = []
}) => {
  const total = secured + waiting + cancellable;
  const ratio = total > 0 ? Math.round((cancellable / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-12 p-12 bg-[#0A0E27] min-h-screen text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
      
      {/* 1. BANNIÈRE — STATUT GLOBAL (AUTORITÉ) */}
      <StatusBanner status={status} count={count} />

      {/* 2. HERO — VERDICT FINANCIER (CHIFFRE DOMINE TOUT) */}
      <section className="flex flex-col items-center justify-center py-16 text-center gap-6">
        <p className="text-[12px] uppercase font-bold tracking-[0.4em] text-white/40 leading-none font-sans">
          Chiffre d'affaires exposé à l'annulation
        </p>
        <h2 className="text-7xl md:text-[88px] font-extrabold font-manrope leading-none tracking-tighter">
          {formatCurrency(cancellable).replace('€', '').trim()}<span className="text-[#FF4757] ml-2 text-4xl">€</span>
        </h2>
        <div className="flex items-center gap-6 mt-4 font-mono text-[13px] tracking-tight">
            <span className="font-semibold text-white/50 uppercase">
                Seuil acceptable : <span className="text-white font-bold">{threshold * 100} %</span>
            </span>
            <div className="w-px h-4 bg-white/10" />
            <span className={`font-bold uppercase ${ratio > threshold * 100 ? 'text-[#FF4757]' : 'text-[#00E676]'}`}>
                Actuel : {ratio}%
            </span>
        </div>
      </section>

      {/* 3. GRAPHE DE PREUVE — AUSTÈRE + PREMIUM (FINITION OUTIL PRO) */}
      <section className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
        <header className="flex justify-between items-end border-b border-white/5 pb-4">
            <h3 className="text-[12px] uppercase font-bold tracking-[0.3em] text-white/20 font-sans">Historique de dérive (30j)</h3>
            <div className="flex gap-6">
                <LegendItem label="Sécurisé" color="#4ADE80" />
                <LegendItem label="En attente" color="#FB923C" />
                <LegendItem label="Annulable" color="#F87171" />
            </div>
        </header>
        <div className="h-[220px] w-full flex items-center justify-center bg-[#0F1629] rounded-2xl border border-white/5 p-10">
            {proofData.length > 0 ? (
                <FinancialRiskProofVisx data={proofData} width={800} height={180} />
            ) : (
                <div className="text-white/10 font-mono text-[11px] uppercase tracking-[0.4em]">
                    [ AUDIT DES PREUVES ANALYTIQUES... ]
                </div>
            )}
        </div>
      </section>

      {/* 4. ACTION — CTA UNIQUE (AUTORITÉ ASSUMÉE) */}
      <section className="flex justify-center mt-8">
        <button className="px-10 py-5 bg-[#FF4757] hover:opacity-90 text-white font-bold uppercase tracking-[0.2em] text-[13px] rounded-xl transition-opacity active:opacity-100">
          Lancer la War Room →
        </button>
      </section>

      {/* 5. CONTEXTE — KPIS PÉRIPHÉRIQUES (MASSE VISUELLE) */}
      <section className="grid grid-cols-3 gap-8 mt-12 max-w-5xl mx-auto w-full">
        <KPICard label="Trésorerie Sécurisée" value={formatCurrency(secured)} tone="success" />
        <KPICard label="En attente d'Acompte" value={formatCurrency(waiting)} tone="warning" />
        <KPICard label="Exposition Totale" value={formatCurrency(cancellable)} tone="danger" />
      </section>
    </div>
  );
};

const StatusBanner = ({ status, count }: { status: FinancialRiskVerdictProps['status']; count: number }) => {
  const config = {
    critical: { icon: "🔥", title: "SITUATION CRITIQUE", sub: `${count} dossiers en danger immédiat`, bg: "bg-red-500/5", border: "border-red-500/20", text: "text-[#FF4757]" },
    tension: { icon: "⚠️", title: "ZONE DE TENSION", sub: "Surveillance active requise", bg: "bg-orange-500/5", border: "border-orange-500/20", text: "text-[#FF9F40]" },
    stable: { icon: "✅", title: "ÉTAT STABLE", sub: "Flux de trésorerie conforme", bg: "bg-emerald-500/5", border: "border-emerald-500/20", text: "text-[#00E676]" },
  };

  const current = config[status];

  return (
    <div className={`flex items-center justify-between p-10 rounded-2xl border transition-all ${current.bg} ${current.border}`}>
      <div className="flex items-center gap-8">
        <span className="text-4xl">{current.icon}</span>
        <div className="flex flex-col gap-2">
          <h1 className={`text-2xl font-extrabold uppercase tracking-widest leading-none font-manrope ${current.text}`}>
            {current.title}
          </h1>
          <p className="text-white/40 text-[13px] font-medium leading-tight font-sans">
            {current.sub}
          </p>
        </div>
      </div>
      <div className="h-12 w-px bg-white/10" />
      <div className="text-right flex flex-col gap-1">
        <span className="text-white/20 text-[10px] uppercase font-bold tracking-[0.3em] block">Autorité Centrale</span>
        <span className="text-white/40 font-mono text-[11px] tracking-tight">V.2.0.4 - TECH_READY</span>
      </div>
    </div>
  );
};

const KPICard = ({ label, value, tone }: { label: string; value: string; tone: 'success' | 'warning' | 'danger' }) => {
  const tones = {
    success: 'text-[#00E676]',
    warning: 'text-[#FF9F40]',
    danger: 'text-[#FF4757]',
  };

  return (
    <div className="p-10 rounded-2xl bg-[#0F1629] border border-white/[0.06] transition-opacity hover:opacity-80">
      <span className="block text-[11px] uppercase font-bold tracking-[0.3em] text-white/30 mb-4 font-sans">{label}</span>
      <span className={`text-3xl font-extrabold font-manrope tracking-tighter ${tones[tone]}`}>{value}</span>
    </div>
  );
};

const LegendItem = ({ label, color }: { label: string; color: string }) => (
    <div className="flex items-center gap-3 font-mono">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[11px] uppercase font-bold tracking-widest text-white/20">{label}</span>
    </div>
);
