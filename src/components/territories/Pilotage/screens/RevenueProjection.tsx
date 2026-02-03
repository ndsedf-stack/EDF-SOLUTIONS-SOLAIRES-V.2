import React from 'react';

/**
 * 🟪 ÉCRAN 4 — PROJECTION CA (ANALYSE)
 * Anticipe l'atterrissage financier à 90 jours.
 * Doctrine : Responsabilisant, pas rassurant.
 */

interface RevenueProjectionProps {
  current: number;
  target: number;
  gap: number;
  weeklyRunRate: number;
}

const formatCurrency = (val: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

export const RevenueProjection: React.FC<RevenueProjectionProps> = ({
  current,
  target,
  gap,
  weeklyRunRate
}) => {
  const isGapNegative = gap < 0;

  return (
    <section className="screen-analysis p-12 bg-[#0A0E27] min-h-screen text-white flex flex-col gap-16 font-sans overflow-x-hidden">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight font-manrope">Projection Chiffre d'Affaires</h1>
        <p className="text-white/40 uppercase tracking-[0.3em] text-[12px] font-bold font-sans">
          Anticipation budgétaire à 90 jours
        </p>
      </header>

      {/* HERO METRICS — LA RÉALITÉ FINANCIÈRE (MASSE VISUELLE) */}
      <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
        <ProjectionMetric label="Sécurisé Actuel" value={current} />
        <ProjectionMetric label="Objectif" value={target} isTarget />
        <ProjectionMetric label="Écart (Gap)" value={gap} isNegative={isGapNegative} />
        <ProjectionMetric label="Rythme / Semaine" value={weeklyRunRate} isNeutral />
      </div>

      {/* CONTEXTE STRATÉGIQUE (AUSTÈRE) */}
      <div className="flex gap-16 items-start mt-4">
          <aside className="flex-1 p-10 border-l-4 border-[#FF4757] bg-[#FF4757]/5 rounded-r-2xl flex flex-col gap-6">
            <p className="text-[20px] text-white/80 leading-relaxed font-semibold italic font-manrope">
              "Le futur n'est jamais une ligne. Il est le produit de l'intensité actuelle."
            </p>
            <p className="text-[13px] text-white/40 uppercase tracking-[0.2em] font-bold font-sans">
              Au rythme actuel ({formatCurrency(weeklyRunRate)}/sem), l'objectif sera atteint avec un retard estimé de <span className="text-white">12 jours</span>.
            </p>
          </aside>

          <div className="w-[340px] flex flex-col gap-6 p-10 bg-[#0F1629] rounded-2xl border border-white/[0.06]">
            <span className="text-[11px] uppercase font-bold tracking-[0.3em] text-white/20 font-sans">Action Requise</span>
            <p className="text-[15px] font-semibold text-white/50 leading-relaxed font-sans">
                Une augmentation de <span className="text-white font-bold">15%</span> de la vélocité commerciale est nécessaire avant la clôture du trimestre.
            </p>
          </div>
      </div>
    </section>
  );
}

function ProjectionMetric({
  label,
  value,
  isTarget,
  isNegative,
  isNeutral
}: {
  label: string;
  value: number;
  isTarget?: boolean;
  isNegative?: boolean;
  isNeutral?: boolean;
}) {
  const textColor = isTarget ? 'text-[#38BDF8]' : isNegative ? 'text-[#FF4757]' : isNeutral ? 'text-white/40' : 'text-[#4ADE80]';
  const bgColor = 'bg-[#0F1629]';

  return (
    <div className={`flex flex-col gap-6 p-12 transition-opacity hover:opacity-90 ${bgColor}`}>
      <span className="text-[11px] uppercase font-bold tracking-[0.3em] text-white/30 leading-none font-sans">
        {label}
      </span>
      <span className={`text-6xl md:text-7xl font-extrabold font-manrope leading-none tracking-tighter ${textColor}`}>
        {formatCurrency(value).replace('€', '').trim()}<span className="text-2xl ml-2 opacity-100 italic">€</span>
      </span>
    </div>
  );
}
