import React from 'react';

export const ConversionFunnelVisx = ({ metrics }: { metrics: any }) => {
  const steps = [
    { label: 'Études', value: metrics.created },
    { label: 'Ouvertures', value: metrics.opened },
    { label: 'Signatures', value: metrics.signed },
    { label: 'Acompte encaissé', value: metrics.secured },
  ];

  const max = Math.max(...steps.map(s => s.value)) || 1;

  return (
    <div className="bg-[#0F1629] p-12 rounded-3xl border border-white/[0.05] h-full flex flex-col justify-between">
      <div className="mb-8">
        <h3 className="text-white font-black uppercase tracking-widest text-xs mb-1">Conversion commerciale</h3>
        <p className="text-[11px] text-white/30 italic">"Où est-ce qu'on perd le client ?"</p>
      </div>

      <div className="space-y-8 flex-1 flex flex-col justify-center">
        {steps.map(step => (
          <div key={step.label} className="group">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white/50 mb-2 group-hover:text-cyan-400 transition-colors">
              <span>{step.label}</span>
              <span className="font-mono text-white">{step.value}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)] transition-all duration-1000"
                style={{ width: `${(step.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
