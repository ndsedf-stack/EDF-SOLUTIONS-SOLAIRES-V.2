import React from 'react';
import { AlertBanner } from '../ui/AlertBanner';
import { HeroLayout } from '../ui/HeroLayout';
import { SlicePanel, SliceRow } from '../ui/SlicePanel';
import { KpiStrip } from '../ui/KpiStrip';
import { RiskPressureVisx } from '../core/RiskPressureVisx';

interface PilotageOverviewProps {
  system: any;
}

export const Screen01_FinancialRisk: React.FC<PilotageOverviewProps> = ({ system }) => {
  const { studies } = system;

  const totalStudies = studies.length;
  const signedCount = studies.filter((s: any) => s.status === 'signed').length;
  const totalVolume = studies.reduce((acc: number, s: any) => acc + (s.project_amount || 0), 0);
  
  // Tension Logic
  const tensionCount = studies.filter((s: any) => s.status === 'signed' && !s.deposit_paid && !s.contract_secured).length;
  const isCritical = tensionCount > 5;
  const riskLevel = isCritical ? 'critical' : 'stable';

  const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  return (
    <main className="min-h-screen bg-[#070912] text-white animate-fadeIn">
      
      {/* 🔴 ZONE 1 — BANNIÈRE (STIGMATE DE RISQUE) */}
      <section className="px-12 pt-10">
        <AlertBanner
          status={riskLevel}
          count={tensionCount}
          onCtaClick={() => console.log('Activation Protocole de Sécurisation')}
        />
      </section>

      {/* 🧠 ZONE 2 — MEDICAL SCAN (PRESSURE + SLICE) */}
      <section className="px-12 mt-4">
        <div className="flex gap-1 h-[580px] bg-[#0F1629] rounded-2xl overflow-hidden border border-white/5 p-1 group">
          
          {/* PRESSURE VISUAL (LA MASSE) */}
          <HeroLayout>
             {() => (
                <>
                    <div className="absolute top-8 left-8 z-10">
                        <h2 className="text-[10px] font-mono text-white/30 tracking-[0.4em] uppercase">
                            Risk Pressure Visual // A.01-SCAN
                        </h2>
                        <p className="text-sm text-[#8B93B0] mt-1">
                            Analyse en temps réel de la tension financière
                        </p>
                    </div>

                    <RiskPressureVisx 
                        level={riskLevel}
                        mode="cockpit"
                    />

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <div className="text-8xl font-bold font-mono tracking-tighter text-white mb-2 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                                {tensionCount}
                            </div>
                            <div className="text-[10px] font-mono text-white/40 tracking-[0.4em] uppercase">
                                Dossiers en Tension
                            </div>
                        </div>
                    </div>
                </>
             )}
          </HeroLayout>

          {/* VERTICAL SLICE (LE RAPPORT) */}
          <SlicePanel 
            title="Scan Financier"
            footer={
                <div className="flex justify-between items-center text-[10px] font-mono text-white/30 uppercase tracking-widest">
                    <span>Scanner Status</span>
                    <span className={isCritical ? 'text-red-500' : 'text-green-500'}>
                        {isCritical ? 'CRITICAL_FAIL' : 'NOMINAL_FLOW'}
                    </span>
                </div>
            }
          >
            <SliceRow label="Total Volume" value={formatCurrency(totalVolume)} tone="info" />
            <SliceRow label="Signatures" value={signedCount.toString()} tone="success" />
            <SliceRow label="Non-Sécurisés" value={tensionCount.toString()} tone="danger" />
          </SlicePanel>
        </div>
      </section>

      {/* 📊 ZONE 3 — KPI SECONDAIRES (CONFIRMATION) */}
      <section className="px-12 mt-12 pb-16 opacity-40 hover:opacity-100 transition-opacity">
        <div className="grid grid-cols-3 gap-6">
          <KpiStrip 
            title="Sûreté Signature"
            value={`${Math.round((signedCount / totalStudies) * 100)}%`}
            label="Ratio dossiers sécurisés"
            icon={<span className="text-xl text-[#00D9FF]">🛡️</span>}
            accentColor="cyan"
            progress={(signedCount / totalStudies) * 100}
          />
          <KpiStrip 
            title="Délai Moyen"
            value="4.2j"
            label="Avant abandon prospect"
            icon={<span className="text-xl text-[#FF9F40]">⏳</span>}
            accentColor="warning"
            progress={40}
          />
          <KpiStrip 
            title="CA Potentiel"
            value={formatCurrency(totalVolume)}
            label="Sur dossiers signés"
            icon={<span className="text-xl text-[#00E676]">💰</span>}
            accentColor="success"
            progress={100}
          />
        </div>
      </section>

    </main>
  );
};
