
import React from 'react';

interface SystemStateProps {
  totalStudies: number;
  activeStudies: number;
  signedStudies: number;
  securedStudies: number;
  waitingStudies: number;
  totalLeads: number;
  activeLeads: number;
  totalEmailsSent: number;
  pendingEmails: number;
  unsubscribedCount: number;
  unsubscribeRate: number;
  onStatClick?: (type: string) => void;
}

export const SystemState: React.FC<SystemStateProps> = ({
  totalStudies,
  activeStudies,
  signedStudies,
  securedStudies,
  waitingStudies,
  onStatClick,
}) => {
  // Calculs dérivés (Simulés pour l'instant si pas passés en props, ou basés sur les props existantes)
  const atRiskCount = Math.max(0, signedStudies - securedStudies);

  return (
    <div className="relative mb-8">
      <div className="relative z-10 px-0">
        <div className="glass-panel py-8 px-10 rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between gap-12">
            
            {/* 1. GROUPE VITAL : CASH & RISQUE */}
            <div className="flex items-center gap-12 flex-1">
               <KPICard
                label="SÉCURISÉES"
                value={securedStudies}
                color="emerald"
                glow
                size="large"
              />
               <KPICard
                label="NON SÉCURISÉES" // ex: "Exposées"
                value={atRiskCount}
                color={atRiskCount > 0 ? "red" : "slate"}
                size="large"
                pulse={atRiskCount > 0}
              />
            </div>

            {/* Séparateur */}
            <div className="h-12 w-px bg-white/10"></div>

            {/* 2. GROUPE PIPELINE */}
            <div className="flex items-center gap-12">
               <KPICard label="TOTAL SIGNÉES" value={signedStudies} color="white" onClick={() => onStatClick?.('revenue')} />
               <KPICard label="EN ATTENTE" value={waitingStudies} color="yellow" />
               <KPICard label="TOTAL ÉTUDES" value={totalStudies} color="slate" size="small" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({
  label,
  value,
  color,
  glow = false,
  isPercentage = false,
  size = "medium",
  pulse = false,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  glow?: boolean;
  isPercentage?: boolean;
  size?: "small" | "medium" | "large";
  pulse?: boolean;
  onClick?: () => void;
}) => {
  const colorMap: Record<string, string> = {
    blue: "text-blue-400 font-black",
    emerald: "text-emerald-400 font-black",
    green: "text-green-400 font-black",
    purple: "text-purple-400 font-black",
    orange: "text-orange-400 font-black",
    indigo: "text-indigo-400 font-black",
    yellow: "text-yellow-400 font-black",
    red: "text-red-500 font-black",
    slate: "text-slate-500 font-black",
    white: "text-white font-black",
  };

  const sizeClasses = {
    small: "text-xl",
    medium: "text-3xl",
    large: "text-5xl",
  };

  const labelClasses = {
    small: "text-[9px] mb-1 opacity-60",
    medium: "text-[10px] mb-2",
    large: "text-[11px] mb-3 tracking-[0.2em]",
  };

  return (
    <div 
      className={`flex flex-col items-center min-w-[80px] group transition-all duration-300 hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className={`${labelClasses[size]} font-black text-slate-500 uppercase tracking-widest text-center group-hover:text-slate-400 transition-colors`}>
        {label}
      </div>
      <div className={`relative ${colorMap[color] || "text-white"} ${sizeClasses[size]} ${pulse ? 'animate-pulse' : ''}`}>
        {glow && (
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
        )}
        <span className="relative z-10 drop-shadow-lg">
          {value}
          {isPercentage && <span className="text-sm ml-1 opacity-60">%</span>}
        </span>
      </div>
    </div>
  );
};
