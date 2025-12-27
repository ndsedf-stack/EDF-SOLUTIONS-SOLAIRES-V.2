import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ProfitBadgeProps {
  totalSavings: number;
  paybackYear: number;
  projectionYears: number;
}

export const ProfitBadge: React.FC<ProfitBadgeProps> = ({
  totalSavings,
  paybackYear,
  projectionYears,
}) => {
  const isProfitable = totalSavings > 0 && paybackYear <= projectionYears;

  return (
    <div
      className={`
      relative overflow-hidden
      min-w-[280px] px-6 py-4 rounded-2xl
      flex items-center justify-between gap-6
      backdrop-blur-md border shadow-2xl transition-all duration-300
      ${
        isProfitable
          ? "bg-emerald-500/15 border-emerald-500/40 shadow-emerald-500/10"
          : "bg-red-500/15 border-red-500/40 shadow-red-500/10"
      }
    `}
    >
      {/* Icône et Statut */}
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            isProfitable ? "bg-emerald-500/20" : "bg-red-500/20"
          }`}
        >
          {isProfitable ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-400" />
          )}
        </div>
        <span
          className={`text-xs font-black uppercase tracking-widest leading-tight ${
            isProfitable ? "text-emerald-400" : "text-red-400"
          }`}
        >
          Projet
          <br />
          Rentable
        </span>
      </div>

      {/* Séparateur */}
      <div
        className={`h-10 w-[1px] ${
          isProfitable ? "bg-emerald-500/30" : "bg-red-500/30"
        }`}
      />

      {/* Chiffres - Bien visibles */}
      <div className="flex flex-col items-end">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-white tracking-tighter">
            {Math.round(totalSavings).toLocaleString("fr-FR")}
          </span>
          <span
            className={`text-lg font-bold ${
              isProfitable ? "text-emerald-400" : "text-red-400"
            }`}
          >
            €
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight opacity-80">
          Gain net sur {projectionYears} ans
        </span>
      </div>
    </div>
  );
};
