import React from 'react';
import { AlertBanner } from '../ui/AlertBanner';
import { HeroLayout } from '../ui/HeroLayout';
import { SlicePanel, SliceRow } from '../ui/SlicePanel';
import { KpiStrip } from '../ui/KpiStrip';
import { MomentumFieldVisx } from '../core/MomentumFieldVisx';

interface PilotagePipelineProps {
  system: any;
}

export const Screen03_Momentum: React.FC<PilotagePipelineProps> = ({ system }) => {
  const { studies } = system;

  // --- LOGIQUE DE MOMENTUM (INERTIE) ---
  const totalSignatures = studies.filter((s: any) => 
    s.status === 'signed' || s.deposit_paid
  ).length;

  const velocity = Math.min(0.9, (totalSignatures / 10) * 0.8);
  const friction = 0.38;
  const isSlowingDown = velocity < 0.5;
  const level = isSlowingDown ? 'tension' : 'stable';

  return (
    <main className="min-h-screen bg-[#070912] text-white animate-fadeIn">
      
      {/* 🟡 ZONE 1 — BANNIÈRE (RYTHME COMMERCIAL) */}
      <section className="px-12 pt-10">
        <AlertBanner
          status={level}
          count={totalSignatures}
          onCtaClick={() => console.log('Optimiser le flux')}
        />
      </section>

      {/* 🌊 ZONE 2 — HERO (MOMENTUM FIELD + SLICE) */}
      <section className="px-12 mt-4">
        <div className="flex gap-1 h-[580px] bg-[#0F1629] rounded-2xl overflow-hidden border border-white/5 p-1 group">
          
          {/* FLOW VISUAL (LE CHAMP DE VITESSE) */}
          <HeroLayout>
            {() => (
                <>
                    <div className="absolute top-8 left-8 z-10">
                        <h2 className="text-[10px] font-mono text-white/30 tracking-[0.4em] uppercase">
                            Commercial Momentum // V.04-FLOW
                        </h2>
                        <p className="text-sm text-[#8B93B0] mt-1">
                            Inertie du pipeline commercial
                        </p>
                    </div>

                    <MomentumFieldVisx
                        level={level}
                        velocity={velocity}
                        friction={friction}
                        blockage={isSlowingDown}
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <div className="text-8xl font-bold font-mono tracking-tighter text-white mb-2 drop-shadow-[0_0_40px_rgba(0,217,255,0.15)]">
                                4,2j
                            </div>
                            <div className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase">
                                Délai moyen de signature
                            </div>
                        </div>
                    </div>
                </>
            )}
          </HeroLayout>

          {/* VERTICAL SLICE (LE RAPPORT DE VITESSE) */}
          <SlicePanel 
            title="Inertie & Flux"
            footer={
                <div className="flex justify-between items-center text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    <span>Flow Status</span>
                    <span className={isSlowingDown ? 'text-orange-500' : 'text-[#00D9FF]'}>
                        {isSlowingDown ? 'INERTIA_LOW' : 'FLOW_OPTIMAL'}
                    </span>
                </div>
            }
          >
            <SliceRow label="Vélocité" value={`${Math.round(velocity * 100)}%`} tone="info" />
            <SliceRow label="Friction" value={`${Math.round(friction * 100)}%`} tone="warning" />
            <SliceRow label="Conversions" value={totalSignatures.toString()} tone="success" />
            
            <div className="my-8 h-px bg-white/5 w-full" />
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <p className="text-[11px] font-mono text-white/40 leading-relaxed">
                    <span className="text-[#00D9FF] font-bold underline">ANALYSE:</span> Le flux horizontal indique un goulot d'étranglement sur la phase "Prospects".
                </p>
            </div>
          </SlicePanel>

        </div>
      </section>

      {/* 📊 ZONE 3 — KPI STRIP (CONFIRMATION) */}
      <section className="px-12 mt-12 pb-16 opacity-40 hover:opacity-100 transition-opacity">
        <div className="grid grid-cols-4 gap-6">
          <KpiStrip title="Leads actifs" value="177" label="Volume entrée" icon={<span className="text-xl text-[#00D9FF]">⚡</span>} accentColor="cyan" progress={70} />
          <KpiStrip title="Conversion" value="34%" label="Taux global" icon={<span className="text-xl text-[#FF9F40]">🔄</span>} accentColor="warning" progress={34} />
          <KpiStrip title="Signatures" value={totalSignatures.toString()} label="Total validé" icon={<span className="text-xl text-[#00E676]">✍️</span>} accentColor="success" progress={80} />
          <KpiStrip title="Goulot" value="Prospects" label="Point de friction" icon={<span className="text-xl text-[#FF4757]">🛑</span>} accentColor="danger" progress={90} />
        </div>
      </section>

    </main>
  );
};
