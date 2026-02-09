import React from 'react';

/**
 * 📈 PipelineMomentumVisx (Core / War Room Version)
 * Transformé en entonnoir premium haute-résolution.
 */

export interface PipelineStep {
  step: 'Lead' | 'RDV' | 'Signature' | 'Acompte';
  volume: number;
  conversion: number; // vs étape précédente (0 à 1)
}

interface Props {
  data: PipelineStep[];
}

const STAGE_CONFIG = {
  'Lead': { color: 'from-slate-500 to-slate-600', icon: '→', bg: 'bg-slate-500/20' },
  'RDV': { color: 'from-blue-500 to-cyan-500', icon: '◆', bg: 'bg-blue-500/20' },
  'Signature': { color: 'from-orange-500 to-amber-500', icon: '✓', bg: 'bg-orange-500/20' },
  'Acompte': { color: 'from-emerald-500 to-green-500', icon: '€', bg: 'bg-emerald-500/20' }
};

export function PipelineMomentumVisx({ data }: Props) {
  return (
    <div className="w-full flex flex-col items-center py-4">
      <div className="w-full max-w-2xl flex flex-col gap-3">
        {data.map((s, i) => {
          const config = STAGE_CONFIG[s.step as keyof typeof STAGE_CONFIG] || STAGE_CONFIG['Lead'];
          const width = 100 - (i * 12); // Effet d'entonnoir progressif
          const isLast = i === data.length - 1;

          return (
            <div key={s.step} className="w-full flex flex-col items-center">
              {/* L'Étage du Funnel */}
              <div 
                className="relative group transition-all duration-300 hover:scale-[1.01]"
                style={{ width: `${width}%` }}
              >
                <div className={`
                  relative overflow-hidden rounded-xl
                  bg-gradient-to-r ${config.color}
                  border border-white/10 shadow-2xl
                `}>
                  {/* Overlay texturé */}
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  
                  <div className="relative px-6 py-4 flex items-center justify-between">
                    {/* Gauche : Label + Icône */}
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center text-white font-black text-lg border border-white/10`}>
                        {config.icon}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-white/50 tracking-[0.2em] uppercase">
                          Cible {i + 1}
                        </span>
                        <span className="text-sm font-black text-white tracking-widest uppercase">
                          {s.step}
                        </span>
                      </div>
                    </div>

                    {/* Droite : Volume */}
                    <div className="flex flex-col items-end">
                      <div className="text-3xl font-black text-white font-mono tabular-nums tracking-tighter">
                        {s.volume.toLocaleString()}
                      </div>
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Dossiers</span>
                    </div>
                  </div>
                </div>

                {/* Badge de conversion (Entre les étages) */}
                {i > 0 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-[#0A0E27] border border-white/10 rounded-full px-4 py-1 shadow-2xl flex items-center gap-2">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Conv.</span>
                      <span className="text-xs font-black text-cyan-400 font-mono">
                        {Math.round(s.conversion * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Connecteur Visuel */}
              {!isLast && (
                <div className="h-6 w-px bg-gradient-to-b from-white/20 to-transparent my-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Diagnostique (Premium) */}
      <div className="mt-12 w-full max-w-2xl grid grid-cols-3 gap-4">
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rendement Global</span>
            <span className="text-xl font-black text-emerald-400 font-mono">
                {data.length > 0 ? Math.round((data[data.length-1].volume / (data[0].volume || 1)) * 100) : 0}%
            </span>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Étanchéité Pipeline</span>
            <span className="text-xl font-black text-blue-400 font-mono">Nominale</span>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Alerte Friction</span>
            <span className="text-xl font-black text-orange-400 font-mono">RDV</span>
        </div>
      </div>
    </div>
  );
}
