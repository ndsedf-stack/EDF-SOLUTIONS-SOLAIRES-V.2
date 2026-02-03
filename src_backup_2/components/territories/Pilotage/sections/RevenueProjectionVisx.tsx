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
  const margin = { top: 40, right: 30, bottom: 50, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleTime({
    domain: extent(data, d => d.date) as [Date, Date],
    range: [0, innerWidth],
  }), [data, innerWidth]);

  const yScale = useMemo(() => scaleLinear({
    domain: [0, max(data, d => Math.max(d.projected, d.target)) || 1000000] as [number, number],
    nice: true,
    range: [innerHeight, 0],
  }), [data, innerHeight]);

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Zone Sécurisée */}
        <AreaClosed<ProjectionPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScale(d.secured)}
          yScale={yScale}
          fill={COLORS.secured}
          fillOpacity={0.2}
          curve={curveMonotoneX}
        />

        {/* Zone Projetée (Delta) */}
        <AreaClosed<ProjectionPoint>
          data={data}
          x={d => xScale(d.date)}
          y0={d => yScale(d.secured)}
          y1={d => yScale(d.projected)}
          yScale={yScale}
          fill={COLORS.projected}
          fillOpacity={0.15}
          curve={curveMonotoneX}
        />

        {/* Ligne Projetée */}
        <LinePath<ProjectionPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScale(d.projected)}
          stroke={COLORS.projected}
          strokeWidth={2}
          strokeDasharray="4,2"
          curve={curveMonotoneX}
        />

        {/* Ligne Objectif (La Vérité) */}
        <LinePath<ProjectionPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScale(d.target)}
          stroke={COLORS.target}
          strokeWidth={2}
          opacity={0.3}
          curve={curveMonotoneX}
        />

        <text 
            x={innerWidth} 
            y={yScale(data[data.length-1].target) - 10} 
            fill="white" 
            fontSize={10} 
            fontWeight="black" 
            textAnchor="end" 
            className="uppercase tracking-widest opacity-30"
        >
            Objectif Board
        </text>

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke={COLORS.axis}
          tickStroke={COLORS.axis}
          tickLabelProps={() => ({
            fill: '#ffffff30',
            fontSize: 10,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
          })}
        />
        <AxisLeft
          scale={yScale}
          stroke={COLORS.axis}
          tickStroke={COLORS.axis}
          tickLabelProps={() => ({
            fill: '#ffffff30',
            fontSize: 10,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'end',
            verticalAnchor: 'middle',
          })}
          tickFormat={d => `${Math.round(d as number / 1000)}k€`}
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
