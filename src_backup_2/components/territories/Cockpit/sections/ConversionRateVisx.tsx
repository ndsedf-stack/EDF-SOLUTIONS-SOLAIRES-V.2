import React from 'react';

export const ConversionRateVisx = ({ rates }: { rates: any }) => {
  return (
    <div className="bg-[#0F1629] p-12 rounded-3xl border border-white/[0.05] h-full flex flex-col justify-between">
      <div className="mb-8">
        <h3 className="text-white font-black uppercase tracking-widest text-xs mb-1">Taux de conversion</h3>
        <p className="text-[11px] text-white/30 italic">"Efficacité réelle du moteur"</p>
      </div>

      <div className="space-y-12">
        <div className="group">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block mb-2 group-hover:text-white/60 transition-colors">Étude → Signature</span>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-white leading-none tracking-tighter">
              {rates.studyToSign}
            </span>
            <span className="text-2xl font-black text-white/20">%</span>
          </div>
        </div>
        
        <div className="group">
          <span className="text-[10px] font-black text-emerald-500/40 uppercase tracking-[0.2em] block mb-2 group-hover:text-emerald-400/60 transition-colors">Signature → Acompte</span>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-emerald-400 leading-none tracking-tighter">
              {rates.signToDeposit}
            </span>
            <span className="text-2xl font-black text-emerald-500/20">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
