import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { AreaClosed, LinePath } from '@visx/shape';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import { extent, max } from 'd3-array';

export type ProjectionPoint = {
  date: Date;
  secured: number;
  projected: number;
  target: number;
};

interface Props {
  data: ProjectionPoint[];
  width: number;
  height: number;
}

const COLORS = {
  secured: '#4ADE80',
  projected: '#38BDF8',
  target: '#ffffff',
  axis: '#ffffff10'
};

const RevenueProjectionInner = ({ data, width, height }: Props) => {
  // SVG Safety Check
  if (width < 10 || height < 10) return null;

  const margin = { top: 40, right: 30, bottom: 50, left: 70 };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const xScale = useMemo(() => scaleTime({
    domain: extent(data, d => d.date) as [Date, Date],
    range: [0, innerWidth],
  }), [data, innerWidth]);

  const yScale = useMemo(() => scaleLinear({
    domain: [0, max(data, d => Math.max(d.projected, d.target)) || 1000000] as [number, number],
    nice: true,
    range: [innerHeight, 0],
  }), [data, innerHeight]);

  const finalPoint = data[data.length - 1];

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Zone Sécurisée (Socle) */}
        <AreaClosed<ProjectionPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScale(d.secured)}
          yScale={yScale}
          fill={COLORS.secured}
          fillOpacity={0.05}
          curve={curveMonotoneX}
        />

        {/* Corridor de Confiance (Incertitude Statistique) */}
        <AreaClosed<ProjectionPoint>
          data={data}
          x={d => xScale(d.date)}
          y0={d => yScale(d.secured)}
          y1={d => yScale(d.projected)}
          yScale={yScale}
          fill={COLORS.projected}
          fillOpacity={0.03}
          curve={curveMonotoneX}
        />
        
        {/* Lignes de délimitation du corridor (Subtiles) */}
        <LinePath<ProjectionPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScale(d.projected)}
          stroke={COLORS.projected}
          strokeWidth={1}
          strokeDasharray="4 4"
          strokeOpacity={0.2}
          curve={curveMonotoneX}
        />

        {/* LIGNE OBJECTIF (Le Benchmark) */}
        <LinePath<ProjectionPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScale(d.target)}
          stroke={COLORS.target}
          strokeWidth={2}
          strokeDasharray="6,4"
          strokeOpacity={0.6}
          curve={curveMonotoneX}
        />

        {/* LIGNE PROJECTION (L'HÉROÏNE ACTUELLE) */}
        <LinePath<ProjectionPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScale((d.secured + d.projected) / 2)}
          stroke={COLORS.projected}
          strokeWidth={4}
          strokeOpacity={0.9}
          curve={curveMonotoneX}
        />

        {/* Marqueur Atterrissage Final */}
        {finalPoint && (
          <Group>
            <circle 
              cx={xScale(finalPoint.date)} 
              cy={yScale((finalPoint.secured + finalPoint.projected) / 2)} 
              r={6} 
              fill={COLORS.projected}
              className="animate-pulse"
            />
            <text 
              x={xScale(finalPoint.date)} 
              y={yScale((finalPoint.secured + finalPoint.projected) / 2) - 15} 
              fill={COLORS.projected} 
              fontSize={10} 
              fontWeight="black" 
              textAnchor="end" 
              className="font-mono uppercase tracking-widest"
            >
              Atterrissage projeté
            </text>
          </Group>
        )}

        {/* Label Target */}
        {finalPoint && (
          <text 
              x={innerWidth} 
              y={yScale(finalPoint.target) - 12} 
              fill="white" 
              fontSize={10} 
              fontWeight="black" 
              textAnchor="end" 
              className="uppercase tracking-widest opacity-40 font-sans"
          >
              Objectif Board Q2
          </text>
        )}

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="transparent"
          tickStroke={COLORS.axis}
          tickLabelProps={() => ({
            fill: '#64748b',
            fontSize: 10,
            fontWeight: 'bold',
            className: 'font-mono',
            textAnchor: 'middle',
          })}
        />
        <AxisLeft
          scale={yScale}
          stroke="transparent"
          tickStroke={COLORS.axis}
          tickLabelProps={() => ({
            fill: '#64748b',
            fontSize: 10,
            fontWeight: 'bold',
            className: 'font-mono',
            textAnchor: 'end',
            verticalAnchor: 'middle',
            dx: -5
          })}
          tickFormat={d => `${Math.round(d as number / 1000)}k`}
          tickValues={[0, 250000, 500000, 750000, 1000000]}
        />
      </Group>
    </svg>
  );
};

export function RevenueProjectionVisx({ data }: { data: ProjectionPoint[] }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ParentSize>
        {({ width, height }) => <RevenueProjectionInner data={data} width={width} height={height} />}
      </ParentSize>
    </div>
  );
}
