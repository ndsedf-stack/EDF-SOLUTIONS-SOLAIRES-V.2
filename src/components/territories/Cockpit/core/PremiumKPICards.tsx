import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface TrendData {
  value: number;
  percentage: number;
  direction: 'up' | 'down' | 'stable';
}

interface MicroMetric {
  label: string;
  value: string | number;
  color?: 'emerald' | 'blue' | 'orange' | 'red' | 'slate';
}

interface KPICardProps {
  type: 'risk' | 'revenue' | 'velocity';
  title: string;
  icon: React.ReactNode;
  heroValue: string | number;
  heroLabel: string;
  trend?: TrendData;
  metrics: MicroMetric[];
  sparklineData?: number[]; // Optionnel : mini graphique
}

// 🎨 COLOR SYSTEM
const colorSchemes = {
  risk: {
    bg: 'bg-gradient-to-br from-red-950/40 to-red-900/10',
    border: 'border-red-500/30',
    glow: 'shadow-[0_0_30px_rgba(239,68,68,0.15)]',
    dot: 'bg-red-500',
    text: 'text-red-400',
    textMuted: 'text-red-300/60',
  },
  revenue: {
    bg: 'bg-gradient-to-br from-emerald-950/40 to-emerald-900/10',
    border: 'border-emerald-500/30',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    dot: 'bg-emerald-500',
    text: 'text-emerald-400',
    textMuted: 'text-emerald-300/60',
  },
  velocity: {
    bg: 'bg-gradient-to-br from-blue-950/40 to-blue-900/10',
    border: 'border-blue-500/30',
    glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    dot: 'bg-blue-500',
    text: 'text-blue-400',
    textMuted: 'text-blue-300/60',
  },
};

const metricColors = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
  slate: 'text-slate-400',
};

// 📊 MINI SPARKLINE (optionnel)
function MicroSparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-8 opacity-30" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 🎯 TREND BADGE
function TrendBadge({ trend }: { trend: TrendData }) {
  const Icon = trend.direction === 'up' ? TrendingUp : 
               trend.direction === 'down' ? TrendingDown : Minus;
  
  const colorClass = trend.direction === 'up' ? 'text-emerald-400 bg-emerald-500/10' :
                     trend.direction === 'down' ? 'text-red-400 bg-red-500/10' :
                     'text-slate-400 bg-slate-500/10';
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${colorClass} text-[10px] font-bold uppercase tracking-wider`}>
      <Icon size={12} />
      <span>{Math.abs(trend.percentage)}%</span>
    </div>
  );
}

// 💎 KPI CARD COMPONENT
export function PremiumKPICard({
  type,
  title,
  icon,
  heroValue,
  heroLabel,
  trend,
  metrics,
  sparklineData,
}: KPICardProps) {
  const scheme = colorSchemes[type];
  
  return (
    <div
      className={`
        ${scheme.bg} ${scheme.border} ${scheme.glow}
        border rounded-3xl p-8
        transition-all duration-500 ease-out
        hover:scale-[1.02] hover:${scheme.glow.replace('0.15', '0.25')}
        group relative overflow-hidden
      `}
    >
      {/* 🌟 GLOW EFFECT (Background) */}
      <div className={`absolute inset-0 ${scheme.dot} opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500`} />
      
      {/* HEADER */}
      <header className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${scheme.dot} animate-pulse`} />
          <h3 className={`text-[10px] font-black ${scheme.text} uppercase tracking-widest`}>
            {title}
          </h3>
        </div>
        <div className={`${scheme.textMuted} opacity-50`}>
          {icon}
        </div>
      </header>

      {/* HERO METRIC */}
      <div className="mb-6 relative z-10">
        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-5xl font-black text-white tracking-tighter font-mono">
            {heroValue}
          </span>
          {trend && <TrendBadge trend={trend} />}
        </div>
        <p className={`text-[10px] font-bold text-slate-500 uppercase tracking-widest`}>
          {heroLabel}
        </p>
      </div>

      {/* SPARKLINE (optionnel) */}
      {sparklineData && sparklineData.length > 0 && (
        <div className={`mb-6 ${scheme.text} relative z-10`}>
          <MicroSparkline data={sparklineData} />
        </div>
      )}

      {/* SECONDARY METRICS */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-white/[0.03] backdrop-blur-sm px-4 py-3 rounded-xl border border-white/5 hover:bg-white/[0.06] transition-colors"
          >
            <span className="block text-[9px] uppercase text-slate-500 mb-1 font-bold tracking-widest">
              {metric.label}
            </span>
            <span className={`text-xl font-black font-mono ${metric.color ? metricColors[metric.color] : 'text-white'}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎯 CLUSTER EXPORTÉ (MODIFIÉ POUR PRENDRE DES PROPS)
export function KPIClusters({ 
    risk, revenue, velocity, history
}: { 
    risk: { exposedCA: number, warRoomCount: number, delayCount: number };
    revenue: { securedCA: number, pipelineCount: number, avgTicket: number };
    velocity: { avgDelayDays: number, activeCount: number, silentCount: number };
    history?: {
        risk?: number[];
        revenue?: number[];
        velocity?: number[];
    };
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 🔴 RISQUE IMMÉDIAT */}
      <PremiumKPICard
        type="risk"
        title="Risque Immédiat"
        icon={<AlertTriangle size={20} />}
        heroValue={`${Math.round(risk.exposedCA / 1000)}k€`}
        heroLabel="CA à Risque"
        trend={{ value: 0, percentage: 12, direction: 'down' }} // 🟢 Mocked trend (improvement) but can be calculated if needed
        metrics={[
          { label: 'War Room', value: risk.warRoomCount, color: 'red' },
          { label: 'Retards Ops', value: risk.delayCount, color: 'orange' },
        ]}
        sparklineData={history?.risk?.length ? history.risk : [120, 100, 80, 60, 40, risk.exposedCA / 1000]} 
      />

      {/* 🟢 SANTÉ REVENU */}
      <PremiumKPICard
        type="revenue"
        title="Santé Revenu"
        icon={<ShieldCheck size={20} />}
        heroValue={`${Math.round(revenue.securedCA / 1000)}k€`}
        heroLabel="CA Sécurisé"
        trend={{ value: revenue.securedCA, percentage: 18, direction: 'up' }} // 🟢 Mocked trend (growth)
        metrics={[
          { label: 'Pipeline', value: revenue.pipelineCount, color: 'emerald' },
          { label: 'Avg Ticket', value: `${Math.round(revenue.avgTicket / 1000)}k€`, color: 'blue' },
        ]}
        sparklineData={history?.revenue?.length ? history.revenue : [150, 170, 180, 200, 220, 230, revenue.securedCA / 1000]} 
      />

      {/* 🔵 VÉLOCITÉ OPS */}
      <PremiumKPICard
        type="velocity"
        title="Vélocité Ops"
        icon={<Zap size={20} />}
        heroValue={`${velocity.avgDelayDays.toFixed(1)}j`} 
        heroLabel="Délai Moyen (Depuis Signé)"
        trend={{ value: 14, percentage: 0, direction: 'stable' }}
        metrics={[
          { label: 'Actifs', value: velocity.activeCount, color: 'blue' },
          { label: 'Silencieux', value: velocity.silentCount, color: 'orange' },
        ]}
        sparklineData={history?.velocity?.length ? history.velocity : [12, 13, 14, 14, 15, 14, 14]} 
      />
    </div>
  );
}
