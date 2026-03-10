import React from 'react';

interface BenchmarkItemProps {
  label: string;
  value: number; // e.g. 4.2 days
  valueStr: string; // "4.2 jours"
  targetValue: number; // e.g. 4.0
  targetLabel: string; // "< 4J"
  unitScale: number; // Max value for bar scale (e.g. 10 days)
  type: 'success' | 'warning' | 'critical';
  trend?: string; // "+0.2j au-dessus"
}

const BenchmarkItem: React.FC<BenchmarkItemProps> = ({ 
  label, value, valueStr, targetValue, targetLabel, unitScale, type, trend 
}) => {
  const barWidthPct = Math.min((value / unitScale) * 100, 100);
  const targetPosPct = Math.min((targetValue / unitScale) * 100, 100);

  const gradients = {
    success: 'bg-gradient-to-r from-[#00D9FF] to-[#0077FF]', // Blue/Cyan
    warning: 'bg-gradient-to-r from-[#FF9F40] to-[#FF6B00]', // Orange
    critical: 'bg-gradient-to-r from-[#FF4757] to-[#D32F2F]', // Red
  };

  const colors = {
    success: 'text-accent-success',
    warning: 'text-accent-warning',
    critical: 'text-accent-critical',
  };

  return (
    <div className="relative w-full mb-12 last:mb-0 group">
      {/* LABEL */}
      <div className="flex justify-between items-end mb-4">
        <h4 className="font-display font-semibold text-white/90 text-sm tracking-wider uppercase">{label}</h4>
        <span className={`font-mono font-bold text-xl text-white`}>{valueStr}</span>
      </div>

      {/* BAR TRACK */}
      <div className="h-[72px] w-full bg-white/5 rounded-[10px] relative overflow-hidden flex items-center px-4">
        
        {/* TARGET LINE */}
        <div 
            className="absolute top-0 bottom-0 w-[3px] border-l-2 border-dashed border-white/30 z-20 h-full"
            style={{ left: `${targetPosPct}%` }}
        >
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-brand-primary px-2 py-0.5 text-[10px] font-mono font-bold text-text-tertiary rounded border border-white/10 whitespace-nowrap">
                TARGET {targetLabel}
            </div>
        </div>

        {/* ACTUAL BAR */}
        <div 
            className={`h-full absolute top-0 left-0 rounded-r-[10px] ${gradients[type]} opacity-90 shadow-lg transition-all duration-1000 ease-out`}
            style={{ width: `${barWidthPct}%` }}
        >
             {/* Value Inside Bar (if wide enough) */}
             {barWidthPct > 15 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono font-bold text-white/20 text-4xl">
                    {value}
                </div>
             )}
        </div>
      </div>

      {/* TREND / FEEDBACK */}
      <div className={`mt-3 font-sans font-medium text-sm flex items-center gap-2 ${colors[type]}`}>
        {type === 'critical' ? '🔥' : type === 'warning' ? '⚠️' : '✅'}
        {trend}
      </div>

    </div>
  );
};

export const BenchmarkMomentumChart: React.FC = () => {
  return (
    <div className="w-full h-full bg-brand-primary rounded-[20px] p-12">
      <h3 className="font-display font-bold text-2xl text-white mb-2">BENCHMARK DE MOMENTUM</h3>
      <p className="font-sans text-sm text-text-secondary mb-12">Performance temporelle vs objectifs</p>
      
      <BenchmarkItem 
        label="Moyenne Signature" 
        value={4.2} 
        valueStr="4.2 jours" 
        targetValue={4.0} 
        targetLabel="< 4J" 
        unitScale={10} 
        type="warning" 
        trend="+0.2j au-dessus de l'objectif"
      />

      <BenchmarkItem 
        label="Moyenne Acompte" 
        value={1.8} 
        valueStr="1.8 jours" 
        targetValue={2.0} 
        targetLabel="< 2J" 
        unitScale={5} 
        type="success" 
        trend="Objectif atteint"
      />

      <BenchmarkItem 
        label="Seuil de Silence" 
        value={3.0} 
        valueStr="3.0 jours" 
        targetValue={2.0} 
        targetLabel="< 2J" 
        unitScale={5} 
        type="critical" 
        trend="CRITICAL — Action requise"
      />
    </div>
  );
};
