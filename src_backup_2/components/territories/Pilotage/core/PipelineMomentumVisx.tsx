import React from 'react';

/**
 * 📈 PipelineMomentumVisx
 * Répond à : "Où le cash se perd dans le cycle de vente ?" (Friction commerciale)
 */

export interface PipelineStep {
  step: 'Lead' | 'RDV' | 'Signature' | 'Acompte';
  volume: number;
  conversion: number; // vs étape précédente (0 à 1)
}

interface Props {
  data: PipelineStep[];
}

export function PipelineMomentumVisx({ data }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full font-sans">
      {data.map((s, i) => {
        // Couleurs de friction (verrouillées selon doctrine)
        const color =
          s.conversion >= 0.6 ? '#4ADE80' : // OK
          s.conversion >= 0.3 ? '#FB923C' : // TENSION
          '#F87171';                        // CRITIQUE (Friction forte)

        return (
          <div 
            key={s.step} 
            className="flex flex-col gap-6 p-8 bg-[#0F1629] border border-white/[0.06] rounded-2xl transition-all hover:bg-white/[0.04]"
          >
            <div className="flex justify-between items-start">
                <span className="text-[11px] uppercase font-bold tracking-[0.3em] text-white/20">
                    {s.step}
                </span>
                {i > 0 && (
                    <div 
                        className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-mono font-bold"
                        style={{ color }}
                    >
                        {Math.round(s.conversion * 100)}% CV
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1">
                <div className="text-5xl font-extrabold font-manrope tracking-tighter text-white">
                    {s.volume}
                </div>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-tight">Dossiers actifs</span>
            </div>

            {i > 0 && (
              <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${Math.round(s.conversion * 100)}%`,
                      background: color,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest opacity-20">
                    <span>Inertie</span>
                    <span>Conversion</span>
                </div>
              </div>
            )}
            
            {i === 0 && (
                <div className="pt-4 border-t border-white/5">
                     <span className="text-[10px] font-medium text-white/40 italic">Volume d'entrée total</span>
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
