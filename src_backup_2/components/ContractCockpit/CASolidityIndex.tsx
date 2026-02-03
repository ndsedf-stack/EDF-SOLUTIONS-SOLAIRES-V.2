import React from "react";
import { ContractKPIs } from "./contractEngine";

interface Props {
  kpis: ContractKPIs;
}

export function CASolidityIndex({ kpis }: Props) {
  const { solidity_index, solidity_7d, solidity_drift } = kpis;

  // Determine color based on solidity score
  const getColorClass = (score: number) => {
    if (score >= 75) return "from-emerald-500 to-emerald-600";
    if (score >= 50) return "from-amber-500 to-amber-600";
    return "from-red-500 to-red-600";
  };

  const getDriftColor = (drift: number) => {
    if (drift > 5) return "text-emerald-400";
    if (drift < -5) return "text-red-400";
    return "text-slate-400";
  };

  const isDrifting = Math.abs(solidity_drift) > 5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-amber-500 rounded-full" />
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            📊 INDICE DE SOLIDITÉ DU CA
          </h2>
          <div className="text-xs text-white/40 font-mono uppercase tracking-wider">
            Qualité structurelle des contrats
          </div>
        </div>
      </div>

      {/* Main Solidity Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Global Solidity - Main Score */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/10 backdrop-blur-xl p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[120px]" />

          <div className="relative z-10">
            <div className="text-xs uppercase tracking-widest text-white/40 mb-4">
              Solidité Globale
            </div>

            {/* Circular Progress */}
            <div className="flex items-center gap-8">
              <div className="relative w-48 h-48">
                <svg className="transform -rotate-90 w-48 h-48">
                  {/* Background circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-white/10"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#solidityGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(solidity_index / 100) * 553} 553`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Score in center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-6xl font-black text-white tracking-tighter">
                    {solidity_index}
                  </div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">
                    / 100
                  </div>
                </div>

                {/* SVG Gradient Definition */}
                <svg width="0" height="0">
                  <defs>
                    <linearGradient
                      id="solidityGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop
                        offset="0%"
                        className={`${getColorClass(solidity_index)}`}
                        stopOpacity="1"
                      />
                      <stop
                        offset="100%"
                        className="text-blue-500"
                        stopOpacity="0.8"
                      />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Interpretation */}
              <div className="flex-1 space-y-4">
                <div className="text-2xl font-bold text-white">
                  {solidity_index >= 75
                    ? "✅ Portefeuille solide"
                    : solidity_index >= 50
                      ? "⚠️ Vigilance requise"
                      : "🚨 Fragilité détectée"}
                </div>
                <div className="text-sm text-white/60 leading-relaxed">
                  {solidity_index >= 75
                    ? `La majorité des contrats présente de faibles risques d'annulation. Situation saine.`
                    : solidity_index >= 50
                      ? `Certains contrats nécessitent un suivi rapproché pour éviter des pertes.`
                      : `Niveau de risque élevé. Actions immédiates recommandées sur les contrats critiques.`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="space-y-4">
          {/* 7-Day Solidity */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 backdrop-blur-xl p-6">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
              Solidité 7 derniers
            </div>
            <div className="text-4xl font-black text-white tracking-tighter mb-1">
              {solidity_7d}
            </div>
            <div className="text-xs text-white/60">Nouveaux contrats</div>
          </div>

          {/* Drift Indicator */}
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${isDrifting ? "from-amber-500/10 to-transparent border-amber-500/20" : "from-slate-500/10 to-transparent border-slate-500/20"} border backdrop-blur-xl p-6`}
          >
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">
              Dérive
            </div>
            <div
              className={`text-4xl font-black ${getDriftColor(solidity_drift)} tracking-tighter mb-1 flex items-center gap-2`}
            >
              {solidity_drift > 0 ? "↗" : solidity_drift < 0 ? "↘" : "→"}
              <span>{Math.abs(solidity_drift).toFixed(1)}</span>
            </div>
            <div className="text-xs text-white/60">
              {solidity_drift > 5
                ? "🟢 Amélioration"
                : solidity_drift < -5
                  ? "🔴 Fragilisation"
                  : "⚪ Stable"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
