import React, { useState } from 'react';
import { AlertBanner } from '../ui/AlertBanner';
import { HeroLayout } from '../ui/HeroLayout';
import { SlicePanel, SliceRow } from '../ui/SlicePanel';
import { KpiStrip } from '../ui/KpiStrip';
import { RevenueProjectionVisx, ProjectionPoint } from '../core/RevenueProjectionVisx';

interface PilotageProjectionProps {
  system: any;
}

export const Screen04_RevenueProjection: React.FC<PilotageProjectionProps> = ({ system }) => {
  const [period, setPeriod] = useState<'30' | '90'>('90');
    
  const mockData: ProjectionPoint[] = React.useMemo(() => {
    const days = period === '30' ? 30 : 90;
    const data: ProjectionPoint[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 10);

    let currentActual = 150000;
    let currentProjected = 150000;

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const isPast = date <= today;
        const growth = Math.floor(Math.random() * 5000) + 1000; 

        if (isPast) {
            currentActual += growth;
            currentProjected = currentActual;
            data.push({
                date,
                actual: currentActual,
                upperBound: currentActual,
                lowerBound: currentActual,
            });
        } else {
            const daysIntoFuture = i - 10;
            const uncertainty = daysIntoFuture * 4000;
            currentProjected += growth * 0.9;
            
            data.push({
                date,
                projected: currentProjected,
                upperBound: currentProjected + uncertainty,
                lowerBound: Math.max(0, currentProjected - uncertainty),
            });
        }
    }
    return data;
  }, [period]);

  const target = 400000;
  const currentRevenue = 305530;
  const isOffTrack = currentRevenue < (target * 0.8);
  const level = isOffTrack ? 'tension' : 'stable';

  const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <main className="min-h-screen bg-[#070912] text-white animate-fadeIn">
      
      <section className="px-12 pt-10">
        <div className="flex justify-between items-end mb-4">
            <AlertBanner
                status={level}
                count={Math.round(target - currentRevenue)}
                onCtaClick={() => console.log('Optimiser trajectoire')}
            />
            
            <div className="bg-[#0F1629] border border-white/5 rounded-lg p-1 flex h-10">
                <button 
                    onClick={() => setPeriod('30')}
                    className={`px-4 rounded-md text-[10px] font-mono uppercase tracking-widest transition-all ${period === '30' ? 'bg-[#00D9FF] text-black font-bold' : 'text-white/40 hover:text-white'}`}
                >
                    30D
                </button>
                <button 
                    onClick={() => setPeriod('90')}
                    className={`px-4 rounded-md text-[10px] font-mono uppercase tracking-widest transition-all ${period === '90' ? 'bg-[#00D9FF] text-black font-bold' : 'text-white/40 hover:text-white'}`}
                >
                    90D
                </button>
            </div>
        </div>
      </section>

      <section className="px-12 mt-4">
        <div className="flex gap-1 h-[580px] bg-[#0F1629] rounded-2xl overflow-hidden border border-white/5 p-1 group">
          
          <HeroLayout>
              {({ width, height }) => (
                <>
                    <div className="absolute top-8 left-8 z-10">
                        <h2 className="text-[10px] font-mono text-white/30 tracking-[0.4em] uppercase">
                            Revenue Projection // P.2024-NAPPE
                        </h2>
                        <p className="text-sm text-[#8B93B0] mt-1">
                            Le futur n'est jamais une ligne.
                        </p>
                    </div>

                    <RevenueProjectionVisx
                        width={width}
                        height={height}
                        data={mockData}
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <div className="text-8xl font-bold font-mono tracking-tighter text-white mb-2 drop-shadow-[0_0_40px_rgba(0,217,255,0.15)]">
                                {formatCurrency(currentRevenue)}
                            </div>
                            <div className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase">
                                Chiffre d'Affaires Réel
                            </div>
                        </div>
                    </div>
                </>
              )}
          </HeroLayout>

          <SlicePanel 
            title="Analysis Snapshot"
            footer={
                <div className="flex justify-between items-center text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    <span>Scan Status</span>
                    <span className={level === 'tension' ? 'text-[#FF9F40]' : 'text-[#00E676]'}>
                        {level.toUpperCase()}_TARGET
                    </span>
                </div>
            }
          >
            <SliceRow label="Objectif" value={formatCurrency(target)} tone="info" />
            <SliceRow label="Actuel" value={formatCurrency(currentRevenue)} tone="success" />
            <SliceRow label="Écart" value={`-${formatCurrency(target - currentRevenue)}`} tone="danger" />

            <div className="my-8 h-px bg-white/5 w-full" />
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <p className="text-[11px] font-mono text-white/40 leading-relaxed">
                    <span className="text-[#00D9FF] font-bold underline">FORECAST:</span> La probabilité d'atteinte est évaluée à <span className="text-[#00E676]">76.4%</span> selon l'inertie actuelle.
                </p>
            </div>
          </SlicePanel>

        </div>
      </section>

      <section className="px-12 mt-12 pb-16 opacity-40 hover:opacity-100 transition-opacity">
        <div className="grid grid-cols-4 gap-6">
          <KpiStrip title="CA Réel" value={formatCurrency(currentRevenue)} label="Total signatures" icon={<span className="text-xl text-[#00D9FF]">💰</span>} accentColor="cyan" progress={76} />
          <KpiStrip title="Objectif" value={formatCurrency(target)} label="Target mensuel" icon={<span className="text-xl text-[#00E676]">🎯</span>} accentColor="success" progress={76.4} />
          <KpiStrip title="Écart" value={`-${formatCurrency(target - currentRevenue)}`} label="Reste à signer" icon={<span className="text-xl text-[#FF9F40]">⚖️</span>} accentColor="warning" progress={23.6} />
          <KpiStrip title="Rythme" value="117 587€" label="/semaine" icon={<span className="text-xl text-[#00E676]">⚡</span>} accentColor="success" progress={100} />
        </div>
      </section>

    </main>
  );
};
