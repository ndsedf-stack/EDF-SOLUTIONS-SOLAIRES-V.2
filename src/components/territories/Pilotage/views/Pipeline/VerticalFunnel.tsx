import React from 'react';

const FlowParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => (
  <div 
    className="absolute w-1 h-1 rounded-full opacity-0 animate-flowDown"
    style={{ 
      backgroundColor: color, 
      left: '50%', 
      transform: 'translateX(-50%)',
      animationDelay: `${delay}s`, 
      animationDuration: '2s' 
    }} 
  />
);

const FunnelStep: React.FC<{
  label: string;
  value: number;
  color: string;
  borderColor: string;
  bgColor: string;
  nextStepConversion?: string;
  isLast?: boolean;
}> = ({ label, value, color, borderColor, bgColor, nextStepConversion, isLast }) => (
  <div className="relative flex flex-col items-center w-full z-10">
    {/* CARD */}
    <div className={`
      w-full p-6 rounded-[14px] border
      flex items-start gap-4
      relative overflow-hidden
      group hover:scale-105 transition-transform duration-300
    `} style={{ backgroundColor: bgColor, borderColor: borderColor }}>
      
      {/* STATUS DOT */}
      <div className="w-4 h-4 rounded-full mt-1" style={{ backgroundColor: color }} />

      {/* TEXT CONTENT */}
      <div>
        <div className="font-display font-bold text-5xl text-white tracking-tighter mb-1 leading-none">
          {value}
        </div>
        <div className="font-sans font-medium text-[15px] text-white/70 leading-tight">
          {label}
        </div>
      </div>

    </div>

    {/* CONNECTOR & FLOW */}
    {!isLast && (
      <div className="h-12 w-0.5 relative my-2 bg-white/5">
         {/* PARTICLES */}
         <FlowParticle delay={0} color={color} />
         <FlowParticle delay={0.6} color={color} />
         <FlowParticle delay={1.2} color={color} />

         {/* LABEL (Rate) */}
         <div className="absolute top-1/2 left-4 -translate-y-1/2 font-mono text-[11px] text-text-tertiary whitespace-nowrap">
            {nextStepConversion}
         </div>
      </div>
    )}
  </div>
);

export const VerticalFunnel: React.FC<{ system: any }> = ({ system }) => {
  // Mock data for funnel
  const data = {
    activeLeads: 177,
    prospects: 32,
    signed: 11,
    secured: 5
  };

  return (
    <div className="w-full h-full bg-brand-card rounded-[20px] shadow-card p-10 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-brand-elevated to-brand-primary opacity-50 z-0" />

        <div className="relative z-10 w-full space-y-2">
            <h3 className="font-display font-bold text-xl text-white mb-8 text-center uppercase tracking-wide">Funnel de Conversion</h3>

            <FunnelStep 
              value={data.activeLeads} 
              label="Leads Actifs" 
              color="#00D9FF" 
              borderColor="rgba(0, 217, 255, 0.2)" 
              bgColor="rgba(0, 217, 255, 0.05)"
              nextStepConversion="82% conversion"
            />
            
            <FunnelStep 
              value={data.prospects} 
              label="Prospects Intéressés" 
              color="#00D9FF" 
              borderColor="rgba(0, 217, 255, 0.25)" 
              bgColor="rgba(0, 217, 255, 0.08)"
              nextStepConversion="34% conversion"
            />

            <FunnelStep 
              value={data.signed} 
              label="Contrats Signés" 
              color="#FF9F40" 
              borderColor="rgba(255, 159, 64, 0.25)" 
              bgColor="rgba(255, 159, 64, 0.08)"
              nextStepConversion="45% sécurisation"
            />

            <FunnelStep 
              value={data.secured} 
              label="Cash Sécurisé" 
              color="#00E676" 
              borderColor="rgba(0, 230, 118, 0.3)" 
              bgColor="rgba(0, 230, 118, 0.10)"
              isLast
            />
        </div>
    </div>
  );
};
