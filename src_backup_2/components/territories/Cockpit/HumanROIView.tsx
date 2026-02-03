import React, { useMemo } from 'react';
import { ParentSize } from '@visx/responsive';
import { Group } from '@visx/group';
import { LinePath, AreaClosed } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { scaleLinear, scaleTime } from '@visx/scale';
import { calculateSystemMetrics } from '@/brain/intelligence/stats';

interface HumanROIViewProps {
  system: any;
}

export const HumanROIView: React.FC<HumanROIViewProps> = ({ system }) => {
  const { studies, trafficData, metrics } = system;
  const stats = useMemo(() => calculateSystemMetrics(studies, system.emailLeads || [], metrics), [studies, system.emailLeads, metrics]);

  // Estimation du temps économisé (15 min par email auto)
  const totalEmails = stats.totalEmailsSent || 0;
  const totalHours = Math.round((totalEmails * 15) / 60);

  // Sparkline data (Heures économisées par jour)
  const sparklineData = useMemo(() => {
    return (trafficData || []).map((t: any) => ({
        date: new Date(t.date),
        value: Math.round((t.envois * 15) / 60)
    }));
  }, [trafficData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
           <div className="h-px flex-1 bg-white/5"></div>
           <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">S03 — ROI HUMAIN ⏱️</h2>
           <div className="h-px flex-1 bg-white/5"></div>
      </div>

      <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-10 flex items-center justify-between">
        <div className="flex-1">
            <span className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4 block">EFFICACITÉ OPÉRATIONNELLE</span>
            <div className="flex items-baseline gap-4">
                <span className="text-7xl font-black text-white tracking-tighter">{totalHours}</span>
                <span className="text-3xl font-black text-white/40 uppercase tracking-tighter">Heures Libérées</span>
            </div>
            <p className="text-indigo-300/60 font-semibold italic mt-4 max-w-md">
                "Pourquoi je paye cet outil plutôt qu'un CRM ? Pour récupérer {totalHours}h de vente active par mois."
            </p>
        </div>

        <div className="w-1/2 h-32 px-10">
            <ParentSize>
                {({ width, height }) => (
                    <Sparkline data={sparklineData} width={width} height={height} color="#818CF8" />
                )}
            </ParentSize>
        </div>
      </div>
    </div>
  );
};

interface SparklineData {
    date: Date;
    value: number;
}

const Sparkline = ({ data, width, height, color }: { data: SparklineData[], width: number, height: number, color: string }) => {
    const xScale = scaleTime({
        domain: [Math.min(...data.map(d => d.date.getTime())), Math.max(...data.map(d => d.date.getTime()))],
        range: [0, width],
    });
    const yScale = scaleLinear({
        domain: [0, Math.max(...data.map(d => d.value)) * 1.2 || 10],
        range: [height, 0],
    });

    return (
        <svg width={width} height={height}>
            <AreaClosed<SparklineData>
                data={data}
                x={d => xScale(d.date)}
                y={d => yScale(d.value)}
                yScale={yScale}
                fill={color}
                fillOpacity={0.1}
                curve={curveMonotoneX}
            />
            <LinePath<SparklineData>
                data={data}
                x={d => xScale(d.date)}
                y={d => yScale(d.value)}
                stroke={color}
                strokeWidth={2}
                curve={curveMonotoneX}
            />
        </svg>
    );
}
