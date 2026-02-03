import React from 'react';
import { ContractKPIs } from './contractEngine';

interface Props {
  kpis: ContractKPIs;
}

function FinancialBlock({
  icon,
  label,
  amount,
  percentage,
  evolution7d = 0,
  color
}: {
  icon: string;
  label: string;
  amount: number;
  percentage: number;
  evolution7d?: number;
  color: 'green' | 'amber' | 'red' | 'black';
}) {
  const colorMap = {
    green: {
      border: 'border-emerald-500/20',
      bg_grad: 'from-emerald-500/10',
      hover_border: 'hover:border-emerald-400/40',
      glow: 'bg-emerald-500/10',
      text_label: 'text-emerald-400/80',
      text_grad: 'from-white via-emerald-100 to-emerald-400',
      evolution: 'text-emerald-400'
    },
    amber: {
      border: 'border-orange-500/20',
      bg_grad: 'from-orange-500/10',
      hover_border: 'hover:border-orange-400/40',
      glow: 'bg-orange-500/10',
      text_label: 'text-orange-400/80',
      text_grad: 'from-white via-orange-100 to-orange-400',
      evolution: 'text-orange-400'
    },
    red: {
      border: 'border-red-500/20',
      bg_grad: 'from-red-500/10',
      hover_border: 'hover:border-red-400/40',
      glow: 'bg-red-500/10',
      text_label: 'text-red-400/80',
      text_grad: 'from-white via-red-100 to-red-400',
      evolution: 'text-red-400'
    },
    black: {
      border: 'border-slate-500/20',
      bg_grad: 'from-slate-500/10',
      hover_border: 'hover:border-slate-400/40',
      glow: 'bg-slate-500/10',
      text_label: 'text-slate-400/80',
      text_grad: 'from-white via-slate-100 to-slate-400',
      evolution: 'text-slate-400'
    },
  };

  const theme = colorMap[color];
  const isPositive = evolution7d > 0;
  const evolutionColor = isPositive ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className={`relative overflow-hidden rounded-xl border ${theme.border} bg-gradient-to-br ${theme.bg_grad} via-transparent to-transparent backdrop-blur-xl ${theme.hover_border} transition-all duration-300 group p-4`}>
      <div className={`absolute top-0 right-0 w-16 h-16 ${theme.glow} rounded-full blur-2xl group-hover:bg-opacity-20 transition-all`}></div>
      
      <div className="relative">
        <div className={`text-[10px] font-bold ${theme.text_label} uppercase tracking-wider mb-2 flex items-center gap-1`}>
          <span>{icon}</span> {label}
        </div>
        
        <div className={`text-2xl font-black mb-1 tracking-tighter bg-gradient-to-br ${theme.text_grad} bg-clip-text text-transparent`}>
          {amount.toLocaleString()} €
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="text-xs text-slate-400">
            {percentage.toFixed(1)}% du total
          </div>
          {evolution7d !== 0 && (
            <div className={`text-[10px] font-bold ${evolutionColor} flex items-center gap-1`}>
              <span>{isPositive ? '↗' : '↘'}</span>
              <span>{Math.abs(evolution7d).toFixed(1)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContractFinancialSummary({ kpis }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">⚖️</span>
        <div>
          <div className="text-white text-xl font-black tracking-tight uppercase">
            BILAN CONTRACTUEL
          </div>
          <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">
            État réel de l'argent signé
          </div>
        </div>
      </div>

      {/* 4 Financial Blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <FinancialBlock
          icon="🔒"
          label="CA Verrouillé"
          amount={kpis.ca_locked}
          percentage={kpis.locked_percentage}
          color="green"
        />
        
        <FinancialBlock
          icon="🟡"
          label="CA Exposé"
          amount={kpis.ca_exposed}
          percentage={kpis.exposed_percentage}
          color="amber"
        />
        
        <FinancialBlock
          icon="🔴"
          label="CA à Risque"
          amount={kpis.ca_at_risk}
          percentage={kpis.risk_percentage}
          color="red"
        />
        
        <FinancialBlock
          icon="⚫"
          label="Perte Potentielle"
          amount={kpis.potential_loss}
          percentage={(kpis.potential_loss / (kpis.ca_locked + kpis.ca_exposed + kpis.ca_at_risk || 1)) * 100}
          color="black"
        />
      </div>
    </div>
  );
}
