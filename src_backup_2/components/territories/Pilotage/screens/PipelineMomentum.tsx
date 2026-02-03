import React from 'react';
import { ConversionFunnelVisx } from '../../Cockpit/sections/ConversionFunnelVisx';

interface PipelineMomentumProps {
  leads: number;
  prospects: number;
  signed: number;
  secured: number;
}

export const PipelineMomentum: React.FC<PipelineMomentumProps> = ({
  leads,
  prospects,
  signed,
  secured
}) => {
  const funnelMetrics = {
    created: leads,
    opened: prospects,
    signed: signed,
    secured: secured,
  };

  return (
    <section className="space-y-12">
      <div className="flex flex-col gap-3">
        <h2 className="text-white font-black uppercase tracking-[0.4em] text-xs">S03 — PIPELINE MOMENTUM</h2>
        <p className="text-white/40 text-sm font-medium italic">"Vélocité et frictions de la machine commerciale (Derniers 30 jours)."</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-8">
            <ConversionFunnelVisx metrics={funnelMetrics} />
        </div>
        
        <div className="md:col-span-4 flex flex-col gap-6">
            <div className="bg-[#0F1629] p-8 rounded-3xl border border-white/5 flex-1 flex flex-col justify-center">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-4">Analyse de friction</span>
                <p className="text-sm text-white/60 leading-relaxed font-medium italic">
                   "La conversion suggère une stagnation au stade de signature. La réaction système est requise pour libérer le potentiel du pipeline."
                </p>
            </div>
            
            <div className="bg-[#0F1629] p-8 rounded-3xl border border-white/5 flex-1 flex flex-col justify-center">
                <span className="text-[10px] font-black text-emerald-500/30 uppercase tracking-[0.2em] block mb-2">Taux d'Efficacité Final</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">{leads > 0 ? Math.round((secured / leads) * 100) : 0}</span>
                    <span className="text-xl font-bold text-white/30">%</span>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
