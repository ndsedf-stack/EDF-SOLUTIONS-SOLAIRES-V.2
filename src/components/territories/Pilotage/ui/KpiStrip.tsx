import React from 'react';

interface KpiStripProps {
  title: string;
  value: string | number;
  label: string;
  variation?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon: React.ReactNode;
  accentColor: 'cyan' | 'success' | 'warning' | 'danger' | 'critical';
  progress?: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  cyan: { border: 'border-accent-cyan', text: 'text-accent-cyan', bg: 'bg-accent-cyan', shadow: 'hover:shadow-[0_12px_32px_rgba(0,217,255,0.25)]' },
  success: { border: 'border-accent-success', text: 'text-accent-success', bg: 'bg-accent-success', shadow: 'hover:shadow-[0_12px_32px_rgba(0,230,118,0.25)]' },
  warning: { border: 'border-accent-warning', text: 'text-accent-warning', bg: 'bg-accent-warning', shadow: 'hover:shadow-[0_12px_32px_rgba(255,159,64,0.25)]' },
  danger: { border: 'border-accent-danger', text: 'text-accent-danger', bg: 'bg-accent-danger', shadow: 'hover:shadow-[0_12px_32px_rgba(255,71,87,0.25)]' },
  critical: { border: 'border-accent-critical', text: 'text-accent-critical', bg: 'bg-accent-critical', shadow: 'hover:shadow-[0_12px_32px_rgba(211,47,47,0.25)]' },
};

export const KpiStrip: React.FC<KpiStripProps> = ({ 
  title, 
  value, 
  label, 
  variation, 
  icon, 
  accentColor = 'cyan', 
  progress
}) => {
  const colors = colorMap[accentColor];

  return (
    <div className={`
      relative overflow-hidden
      bg-gradient-to-br from-[#141B2E] to-[#0F1629]
      border border-white/5 rounded-2xl p-7
      transition-all duration-200 ease-out
      hover:-translate-y-1 hover:border-2 ${colors.border} ${colors.shadow}
      group cursor-default
    `}>
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div className={`opacity-40 group-hover:opacity-100 transition-opacity duration-200 ${colors.text}`}>
          {icon}
        </div>
        {variation && (
          <div className={`
            px-2 py-0.5 rounded text-xs font-medium bg-white/5
            ${variation.type === 'positive' ? 'text-accent-success' : variation.type === 'negative' ? 'text-accent-danger' : 'text-text-tertiary'}
          `}>
            {variation.value}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col gap-2 relative z-10">
        <div className="font-display font-bold text-4xl tracking-tight text-white">
          {value}
        </div>
        <div className="font-sans text-sm text-text-secondary">
          {label}
        </div>
      </div>

      {/* PROGRESS BAR */}
      {progress !== undefined && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div 
                className={`h-full ${colors.bg} transition-all duration-1000`} 
                style={{ width: `${progress}%` }}
            />
        </div>
      )}
    </div>
  );
};
