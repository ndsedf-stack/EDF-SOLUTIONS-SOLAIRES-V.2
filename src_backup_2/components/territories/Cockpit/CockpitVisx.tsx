import React, { useMemo } from 'react';
import { FinancialVerdict } from './sections/FinancialVerdict';
import { RevenueEvolutionVisx } from './sections/RevenueEvolutionVisx';
import { ConversionFunnelVisx } from './sections/ConversionFunnelVisx';
import { ConversionRateVisx } from './sections/ConversionRateVisx';
import { HumanROIKpi } from './sections/HumanROIKpi';
import { WarRoomPreview } from './sections/WarRoomPreview';
import { calculateSystemMetrics } from '@/brain/intelligence/stats';

interface CockpitVisxProps {
  system: any;
}

export const CockpitVisx: React.FC<CockpitVisxProps> = ({ system }) => {
  const { studies, emailLeads, metrics, logs, trafficData } = system;

  // 📊 CALCUL DES MÉTRIQUES RÉELLES POUR LES SECTIONS
  const stats = useMemo(() => calculateSystemMetrics(studies, emailLeads || [], metrics), [studies, emailLeads, metrics]);

  // S02 - Données temporelles Revenue (30 jours)
  const revenueData = useMemo(() => {
    const historicalDays = 30;
    const days = Array.from({ length: historicalDays }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (historicalDays - 1 - i));
        return d.toISOString().split('T')[0];
    });

    return days.map(dayStr => {
        const studiesAtDate = studies.filter((s: any) => s.created_at <= dayStr);
        const secured = studiesAtDate.filter((s: any) => s.status === 'signed' && s.deposit_paid).reduce((sum: number, s: any) => sum + (s.total_price || 0), 0);
        const signed = studiesAtDate.filter((s: any) => s.status === 'signed' && !s.deposit_paid).reduce((sum: number, s: any) => sum + (s.total_price || 0), 0);
        const lost = studiesAtDate.filter((s: any) => s.status === 'cancelled').reduce((sum: number, s: any) => sum + (s.total_price || 0), 0);
        
        return {
            date: new Date(dayStr),
            secured,
            signed,
            cancelled: lost
        };
    });
  }, [studies]);

  // S02 - Données Funnel
  const funnelMetrics = {
    created: studies.length,
    opened: studies.filter((s: any) => (s.opened_count || 0) > 0).length,
    signed: studies.filter((s: any) => s.status === 'signed').length,
    secured: studies.filter((s: any) => s.deposit_paid).length,
  };

  // S02 - Données Taux
  const conversionRates = {
    studyToSign: funnelMetrics.created > 0 ? Math.round((funnelMetrics.signed / funnelMetrics.created) * 100) : 0,
    signToDeposit: funnelMetrics.signed > 0 ? Math.round((funnelMetrics.secured / funnelMetrics.signed) * 100) : 0,
  };

  return (
    <div className="flex flex-col gap-16 py-8 px-4 max-w-[1400px] mx-auto pb-32">
      
      {/* S01 — VERDICT FINANCIER */}
      <FinancialVerdict stats={{
        cashSecured: studies.filter((s: any) => s.status === 'signed' && s.deposit_paid).reduce((sum: number, s: any) => sum + (s.total_price || 0), 0),
        cashAtRisk: studies.filter((s: any) => s.status === 'signed' && !s.deposit_paid).reduce((sum: number, s: any) => sum + (s.total_price || 0), 0),
        cashLost: studies.filter((s: any) => s.status === 'cancelled').reduce((sum: number, s: any) => sum + (s.total_price || 0), 0),
      }} />

      {/* S02 — ACTIVITÉ & PERFORMANCE */}
      <section className="grid grid-cols-12 gap-12">
        <div className="col-span-12">
          <RevenueEvolutionVisx data={revenueData} />
        </div>

        <div className="col-span-12 lg:col-span-7">
          <ConversionFunnelVisx metrics={funnelMetrics} />
        </div>

        <div className="col-span-12 lg:col-span-5">
          <ConversionRateVisx rates={conversionRates} />
        </div>
      </section>

      {/* S03 — ROI HUMAIN */}
      <HumanROIKpi emailsSent={stats.totalEmailsSent} />

      {/* S04 — WAR ROOM */}
      <WarRoomPreview metrics={metrics} />

    </div>
  );
};
