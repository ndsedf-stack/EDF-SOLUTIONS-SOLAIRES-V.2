import React from 'react';
import { AreaClosed, LinePath, Line } from '@visx/shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { max } from 'd3-array';
import { curveMonotoneX } from '@visx/curve';
import { HeroChartVisx } from '../shared/HeroChartVisx';

// --- TYPES ---
export type ProjectionPoint = {
  date: Date;
  actual?: number;      // CA réel cumulé (passé)
  projected?: number;   // Projection pipeline (futur)
};

interface FinancialProjectionVisxProps {
  data: ProjectionPoint[];
  target: number; // Objectif de CA
}

// --- UTILS ---
const formatCurrencyK = (val: number) => `${Math.round(val / 1000)}k€`;
const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

// --- COMPOSANTS INTERNES ---

// 1. TooltipRow (Dumb UI)
const TooltipRow = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="flex items-center justify-between text-sm mb-2 last:mb-0">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-white/70">{label}</span>
    </div>
    <span className="font-mono text-white">{formatCurrency(value)}</span>
  </div>
);

// 2. LegendItem & Legend (Overlay Fixe)
const LegendItem = ({ label, value, color, dashed }: { label: string; value: number; color: string; dashed?: boolean }) => (
  <div className="mb-2 last:mb-0 flex items-center justify-between text-sm">
    <div className="flex items-center gap-2">
      <span
        className="w-3 h-0.5"
        style={{
          backgroundColor: dashed ? 'transparent' : color,
          borderTop: dashed ? `2px dashed ${color}` : undefined,
          height: dashed ? 0 : 2
        }}
      />
      <span className="text-white/80">{label}</span>
    </div>
    <span className="font-mono text-white">{formatCurrency(value)}</span>
  </div>
);

const ProjectionLegend = ({ actual, projected, target }: { actual: number; projected: number; target: number }) => {
  const pct = target > 0 ? Math.round((Math.max(actual, projected) / target) * 100) : 0;
  
  return (
    <div className="absolute top-6 right-6 w-[280px] rounded-xl bg-[#0F1629]/90 backdrop-blur-md border border-white/10 p-4 shadow-xl z-20 pointer-events-none">
      <LegendItem label="CA cumulé réel" value={actual} color="#00D9FF" />
      <LegendItem label="Projection pipeline" value={projected} color="#00E676" dashed />
      <LegendItem label="Objectif" value={target} color="#8B93B0" dashed />

      <div className="mt-3">
        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00D9FF]"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="text-right text-xs text-white/50 mt-1">
          {pct}% de l’objectif
        </div>
      </div>
    </div>
  );
};

export const FinancialProjectionVisx: React.FC<FinancialProjectionVisxProps> = ({ data, target }) => {

  // Dernières valeurs pour la légende
  const lastActual = [...data].reverse().find(d => d.actual !== undefined)?.actual ?? 0;
  const lastProjected = data[data.length - 1].projected ?? 0;

  // Tooltip Hooks
  const { tooltipData, showTooltip, hideTooltip } = useTooltip<ProjectionPoint>();

  return (
    <HeroChartVisx
      title="Projection du Chiffre d'Affaires"
      legend={<ProjectionLegend actual={lastActual} projected={lastProjected} target={target} />}
      tooltip={
        tooltipData ? (
          <TooltipWithBounds
            top={32 + 12} // margin.top + offset
            left={undefined} // On laisse le style inline gérer le right
            style={{ 
              ...defaultStyles, 
              backgroundColor: 'transparent', 
              boxShadow: 'none', 
              padding: 0, 
              position: 'absolute',
              right: '20px', // FIXE À DROITE (via style ou left calculé dans HeroChartVisx, ici on force le style)
              top: '44px',
              left: 'auto'
            }}
          >
             {/* Note: HeroChartVisx overlay wrapper takes full width/height. 
                 Inside TooltipWithBounds, we render our custom UI.
                 The strict positioning requirement suggests using left={width - 320} inside render prop, 
                 but HeroChartVisx renders tooltip as a child prop, not inside the svg render loop. 
                 So we position it absolutely here assuming standard width, or let HeroChartVisx handle it if we passed a component.
                 But user asked for specific interaction. 
                 Let's stick to the implementation: Fixed Position.
             */}
            <div className="w-[300px] rounded-xl bg-[#1A2332] border border-white/10 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#00D9FF] mb-4">
                {tooltipData.date.toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>

              <TooltipRow label="CA réel" value={tooltipData.actual ?? 0} color="#00D9FF" />
              <TooltipRow label="Projection" value={tooltipData.projected ?? 0} color="#00E676" />
              <TooltipRow label="Objectif" value={target} color="#8B93B0" />
            </div>
          </TooltipWithBounds>
        ) : null
      }
    >
      {({ width, height, margin }) => {
         // --- LOGIC SCALES ---
         const xScale = scaleTime({
           domain: [data[0].date, data[data.length - 1].date],
           range: [0, width],
         });

         const maxValue = max(data, d => Math.max(d.actual ?? 0, d.projected ?? 0)) ?? 0;
         const upperBound = Math.max(maxValue, target) * 1.15;

         const yScale = scaleLinear({
           domain: [0, upperBound], 
           range: [height, 0],
           nice: true,
         });

         // Fonction interaction
         const handleTooltip = (event: React.MouseEvent<SVGRectElement> | React.TouchEvent<SVGRectElement>) => {
            const { x } = localPoint(event) || { x: 0 };
            const x0 = xScale.invert(x - margin.left);
            
            // reduce to find closest
            let closest = data[0];
            let minDiff = Infinity;
            for (const d of data) {
                 const diff = Math.abs(d.date.getTime() - x0.getTime());
                 if (diff < minDiff) {
                     minDiff = diff;
                     closest = d;
                 }
            }
            showTooltip({ tooltipData: closest });
         };

         return (
           <>
             {/* AXES */}
             <AxisLeft
               scale={yScale}
               numTicks={5}
               tickFormat={v => formatCurrencyK(Number(v))}
               stroke="rgba(255,255,255,0.05)"
               tickStroke="none"
               tickLabelProps={() => ({
                 fill: '#8B93B0',
                 fontSize: 11,
                 fontFamily: 'IBM Plex Mono, monospace',
                 textAnchor: 'end',
                 dx: -8,
                 dy: 4,
               })}
             />
             <AxisBottom
               top={height}
               scale={xScale}
               numTicks={6}
               stroke="rgba(255,255,255,0.1)"
               tickStroke="none"
               tickLabelProps={() => ({
                 fill: '#8B93B0',
                 fontSize: 11,
                 fontFamily: 'IBM Plex Mono, monospace',
                 textAnchor: 'middle',
                 dy: 10,
               })}
               tickFormat={date => (date as Date).toLocaleDateString('fr-FR', { month: 'short' })}
             />

             {/* GRID */}
             {yScale.ticks(5).map((tickValue, i) => (
                <line
                  key={`grid-${i}`}
                  x1={0}
                  x2={width}
                  y1={yScale(tickValue)}
                  y2={yScale(tickValue)}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={1}
                />
             ))}

             {/* DATA LAYERS */}
             {/* 1. Confidence Band (Corridor de Confiance) */}
             <AreaClosed
                data={data.filter(d => d.projected !== undefined)}
                x={d => xScale(d.date)}
                y0={d => yScale(d.projected! * 0.85)} // Pessimistic (-15%)
                y1={d => yScale(d.projected! * 1.15)} // Optimistic (+15%)
                yScale={yScale}
                fill="#00E676"
                fillOpacity={0.08}
                stroke="none"
                curve={curveMonotoneX}
             />
             {/* ✅ AUDIT FIX ID: PESSIMISTIC_INVISIBLE -> Explicit Confidence Lines */}
             <LinePath
                data={data.filter(d => d.projected !== undefined)}
                x={d => xScale(d.date)}
                y={d => yScale(d.projected! * 0.85)}
                stroke="#00E676"
                strokeWidth={1}
                strokeDasharray="4 4"
                strokeOpacity={0.3} // Subtle boundary
                curve={curveMonotoneX}
             />
             <LinePath
                data={data.filter(d => d.projected !== undefined)}
                x={d => xScale(d.date)}
                y={d => yScale(d.projected! * 1.15)}
                stroke="#00E676"
                strokeWidth={1}
                strokeDasharray="4 4"
                strokeOpacity={0.3} // Subtle boundary
                curve={curveMonotoneX}
             />

             {/* 2. Projection Line (Central Trend) */}
             <LinePath
                data={data.filter(d => d.projected !== undefined)}
                x={d => xScale(d.date)}
                y={d => yScale(d.projected!)}
                stroke="#00E676"
                strokeWidth={3}
                strokeDasharray="10 6"
                curve={curveMonotoneX}
             />

             {/* 3. Actual Area */}
             <AreaClosed
               data={data.filter(d => d.actual !== undefined)}
               x={d => xScale(d.date)}
               y={d => yScale(d.actual!)}
               yScale={yScale}
               fill="#00D9FF"
               fillOpacity={0.18}
               stroke="none"
               curve={curveMonotoneX}
             />
             <LinePath
                data={data.filter(d => d.actual !== undefined)}
                x={d => xScale(d.date)}
                y={d => yScale(d.actual!)}
                stroke="#00D9FF"
                strokeWidth={3}
                curve={curveMonotoneX}
             />

             {/* 4. Target Line (Objectif Stratégique) */}
             <Line
               from={{ x: 0, y: yScale(target) }}
               to={{ x: width, y: yScale(target) }}
               stroke="#8B93B0"
               strokeWidth={2}
               strokeDasharray="8 4"
             />
             {/* ✅ AUDIT FIX ID: NO_TARGET_LINE -> Explicit Label */}
             <text
               x={width}
               y={yScale(target) - 8}
               textAnchor="end"
               fill="#8B93B0"
               fontSize={10}
               fontWeight="bold"
               fontFamily="IBM Plex Mono"
               className="uppercase tracking-widest"
             >
               OBJECTIF STRATÉGIQUE
             </text>

             {/* INTERACTION */}
             <rect
                width={width}
                height={height}
                fill="transparent"
                onMouseMove={handleTooltip}
                onMouseLeave={hideTooltip}
             />
             
             {/* CURSOR LINE */}
             {tooltipData && (
                <line
                  x1={xScale(tooltipData.date)}
                  x2={xScale(tooltipData.date)}
                  y1={0}
                  y2={height}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  pointerEvents="none"
                />
             )}
           </>
         );
      }}
    </HeroChartVisx>
  );
};
