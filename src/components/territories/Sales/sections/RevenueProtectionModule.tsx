import React from "react";
import { DualFlowVisx } from './DualFlowVisx';

/**
 * ULTRA PREMIUM COCKPIT MODULE
 * Concept preserved:
 * - Autopilot protects revenue
 * - Creation vs protection dynamic
 * - Commercial velocity impact
 * - Resource savings
 *
 * But redesigned for:
 * ✔ Boardroom VC clarity
 * ✔ SaaS premium aesthetic
 * ✔ Sales operational cockpit
 * ✔ Storytelling persuasion
 * ✔ Decision-first UX
 */

interface StageData {
  label: string;
  created: number;
  protected: number;
}

interface TimeSeriesPoint {
  date: Date;
  leads: number;
  securedAfterRisk: number;
}

interface RevenueProtectionModuleProps {
  revenueProtected: number;
  revenueAtRisk: number;
  velocityBefore: number;
  velocityNow: number;
  hoursSaved: number;
  data: StageData[];
  timeSeriesData: TimeSeriesPoint[];
  period?: string;
}

export const RevenueProtectionModule = ({
  revenueProtected,
  revenueAtRisk,
  velocityBefore,
  velocityNow,
  hoursSaved,
  data,
  timeSeriesData,
  period = "ce mois"
}: RevenueProtectionModuleProps) => {
  const velocityGain = velocityBefore - velocityNow;
  const velocityPct = Math.round((velocityGain / velocityBefore) * 100);

  return (
    <section className="w-full rounded-2xl bg-gradient-to-br from-[#0c111b] to-[#111827] p-8 border border-white/5 shadow-2xl">
      {/* HERO STORY */}
      <header className="mb-10">
        <div className="text-[10px] tracking-[0.35em] text-white/30 uppercase mb-3">
          Revenue Protection Engine
        </div>

        <h1 className="text-3xl font-semibold text-white leading-tight mb-3 max-w-3xl">
          {revenueProtected.toLocaleString()}€ de chiffre d'affaires sécurisés {period}
        </h1>

        <p className="text-white/50 text-sm max-w-2xl">
          Sans autopilote, environ {revenueAtRisk.toLocaleString()}€ resteraient exposés
          aux abandons clients et ralentissements commerciaux.
        </p>
      </header>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-8">

        {/* LEFT: STORYTELLING GRAPH */}
        <div className="col-span-8 bg-white/[0.02] border border-white/[0.05] rounded-xl p-6">
          <div className="flex justify-between mb-6">
            <div>
              <div className="text-sm text-white/40">Création vs Protection</div>
              <div className="text-white font-semibold">
                Où se joue réellement la valeur commerciale
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-white/30">CA exposé</div>
              <div className="text-orange-400 font-bold">
                {revenueAtRisk.toLocaleString()}€
              </div>
            </div>
          </div>

          {/* GRAPH */}
          <div className="h-80">
            <DualFlowVisx data={timeSeriesData} />
          </div>

          <div className="mt-5 text-xs text-white/40 italic">
            L'autopilote n'augmente pas seulement les leads :
            il réduit l'érosion du chiffre signé.
          </div>
        </div>

        {/* RIGHT COLUMN KPIs */}
        <div className="col-span-4 flex flex-col gap-6">

          {/* VELOCITY CARD */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5">
            <div className="text-[9px] uppercase tracking-wider text-white/40 mb-2">
              Vélocité commerciale
            </div>

            <div className="text-3xl font-bold text-emerald-400 mb-1">
              {velocityNow} jours
            </div>

            <div className="text-white/40 text-xs mb-3">
              Avant : {velocityBefore} jours
            </div>

            <div className="text-xs text-emerald-400">
              −{velocityPct}% délai moyen
            </div>
          </div>

          {/* RESOURCE SAVINGS */}
          <div className="bg-gradient-to-br from-[#1b2335] to-[#1f2a40] border border-white/5 rounded-xl p-5">
            <div className="text-[9px] uppercase tracking-wider text-white/40 mb-2">
              Temps commercial libéré
            </div>

            <div className="text-3xl font-bold text-white mb-1">
              {hoursSaved}h
            </div>

            <div className="text-xs text-white/40">
              Automatisation reassurance client
            </div>
          </div>
        </div>
      </div>

      {/* BOARDROOM ACTION LINE */}
      <footer className="mt-10 border-t border-white/5 pt-6 flex justify-between items-center">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/40">
            Lecture exécutive
          </div>

          <div className="text-white text-sm">
            Priorité : sécuriser davantage la phase closing pour réduire
            l'exposition au churn commercial.
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-white/40">Impact potentiel</div>
          <div className="text-2xl font-bold text-emerald-400">
            +{revenueAtRisk.toLocaleString()}€ récupérables
          </div>
        </div>
      </footer>
    </section>
  );
};
