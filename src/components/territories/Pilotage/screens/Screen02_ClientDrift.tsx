import React from 'react';
import { AlertBanner } from '../ui/AlertBanner';
import { HeroLayout } from '../ui/HeroLayout';
import { SlicePanel, SliceRow, SliceHint } from '../ui/SlicePanel';
import { KpiStrip } from '../ui/KpiStrip';
import { AttentionFieldVisx } from '../core/AttentionFieldVisx';

interface PilotageDriftProps {
  system: any;
}

export const Screen02_ClientDrift: React.FC<PilotageDriftProps> = ({ system }) => {
  const { studies } = system;

  // --- LOGIQUE COMPORTEMENTALE (DRIFT) ---
  const totalSigned = studies.filter((s: any) => s.status === 'signed').length;
  const silentDossiers = studies.filter((s: any) => 
    s.status === 'signed' && 
    !s.deposit_paid && 
    !s.contract_secured &&
    new Date().getTime() - new Date(s.signed_date || s.signed_at).getTime() > 7 * 24 * 60 * 60 * 1000
  );
  
  const silentCount = silentDossiers.length;
  const driftRate = totalSigned > 0 ? (silentCount / totalSigned) * 100 : 0;
  
  // Niveaux d'alerte comportementale
  const level = driftRate > 40 ? 'critical' : driftRate > 20 ? 'tension' : 'stable';

  return (
    <main className="min-h-screen bg-[#070912] text-white animate-fadeIn">
      
      {/* 🟡 ZONE 1 — BANNIÈRE (TENSION COMPORTEMENTALE) */}
      <section className="px-12 pt-10">
        <AlertBanner
          status={level}
          count={silentCount}
          onCtaClick={() => console.log('Activation relance')}
        />
      </section>

      {/* 🌫️ ZONE 2 — HERO (ATTENTION FIELD + SLICE) */}
      <section className="px-12 mt-4">
        <div className="flex gap-1 h-[580px] bg-[#0F1629] rounded-2xl overflow-hidden border border-white/5 p-1 group">
          
          {/* PRESSURE VISUAL (LE CHAMP D'ATTENTION) */}
          <HeroLayout>
            {() => (
                <>
                    <div className="absolute top-8 left-8 z-10">
                        <h2 className="text-[10px] font-mono text-white/30 tracking-[0.4em] uppercase">
                            Attention Client // B.07-SHIFT
                        </h2>
                        <p className="text-sm text-[#8B93B0] mt-1">
                            Érosion comportementale en cours
                        </p>
                    </div>

                    <AttentionFieldVisx
                        level={level}
                        active={totalSigned - silentCount}
                        closing={2} 
                        silent={silentCount}
                    />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <div className="text-8xl font-bold font-mono tracking-tighter text-white mb-2 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                                {Math.round(driftRate)}%
                            </div>
                            <div className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase">
                                Clients Silencieux
                            </div>
                        </div>
                    </div>
                </>
            )}
          </HeroLayout>

          {/* VERTICAL SLICE (LE RAPPORT COMPORTEMENTAL) */}
          <SlicePanel 
            title="Analyse comportementale"
            footer={
                <div className="flex justify-between items-center text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    <span>Scan Status</span>
                    <span className={level === 'critical' ? 'text-red-500' : 'text-[#00D9FF]'}>
                        {level.toUpperCase()}_SHIFT
                    </span>
                </div>
            }
          >
            <SliceRow label="Actifs" value={(totalSigned - silentCount).toString()} tone="info" />
            <SliceRow label="Closing" value="1" tone="success" />
            <SliceRow label="Silencieux" value={silentCount.toString()} tone="danger" />
            
            <div className="my-8 h-px bg-white/5 w-full" />
            <SliceHint>{Math.round(driftRate)}% des clients deviennent silencieux après J+7.</SliceHint>
          </SlicePanel>

        </div>
      </section>

      {/* 📊 ZONE 3 — KPI SECONDAIRES */}
      <section className="px-12 mt-12 pb-16 opacity-40 hover:opacity-100 transition-opacity">
        <div className="grid grid-cols-3 gap-6">
          <KpiStrip 
            title="Silence J+7"
            value={silentCount.toString()}
            label="Dossiers sans nouvelles"
            icon={<span className="text-xl text-[#FF9F40]">⏳</span>}
            accentColor="warning"
            progress={driftRate}
          />
          <KpiStrip 
            title="Risque Rupture"
            value="72%"
            label="Détérioration à J+14"
            icon={<span className="text-xl text-[#FF4757]">🎯</span>}
            accentColor="danger"
            progress={72}
          />
          <KpiStrip 
            title="Engagement"
            value={(totalSigned - silentCount).toString()}
            label="Dossiers sous contrôle"
            icon={<span className="text-xl text-[#00E676]">⭐</span>}
            accentColor="success"
            progress={100 - driftRate}
          />
        </div>
      </section>

    </main>
  );
};
