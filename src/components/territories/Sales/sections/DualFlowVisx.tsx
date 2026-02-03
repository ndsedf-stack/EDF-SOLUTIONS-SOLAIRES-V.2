import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { LinePath, AreaClosed } from '@visx/shape';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import { extent, max } from 'd3-array';

export type DualFlowPoint = {
  date: Date;
  leads: number;
  securedAfterRisk: number; // En k€
};

interface Props {
  data: DualFlowPoint[];
  width: number;
  height: number;
}

const DualFlowInner = ({ data, width, height }: Props) => {
  const margin = { top: 40, right: 60, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleTime({
    domain: extent(data, d => d.date) as [Date, Date],
    range: [0, innerWidth],
  }), [data, innerWidth]);

  const yScaleLeads = useMemo(() => scaleLinear({
    domain: [0, max(data, d => d.leads) * 1.5 || 50],
    range: [innerHeight, 0],
  }), [data, innerHeight]);

  const yScaleCash = useMemo(() => scaleLinear({
    domain: [0, max(data, d => d.securedAfterRisk) * 1.5 || 100],
    range: [innerHeight, 0],
  }), [data, innerHeight]);

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* LEADS (Création) */}
        <AreaClosed<DualFlowPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScaleLeads(d.leads)}
          yScale={yScaleLeads}
          fill="#38BDF8"
          fillOpacity={0.1}
          curve={curveMonotoneX}
        />
        <LinePath<DualFlowPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScaleLeads(d.leads)}
          stroke="#38BDF8"
          strokeWidth={3}
          curve={curveMonotoneX}
        />

        {/* SECURED (Protection) */}
        <AreaClosed<DualFlowPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScaleCash(d.securedAfterRisk)}
          yScale={yScaleCash}
          fill="#4ADE80"
          fillOpacity={0.1}
          curve={curveMonotoneX}
        />
        <LinePath<DualFlowPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScaleCash(d.securedAfterRisk)}
          stroke="#4ADE80"
          strokeWidth={3}
          curve={curveMonotoneX}
        />

        {/* Légende flottante discrète */}
        <Group top={-20}>
            <circle cx={0} cy={0} r={4} fill="#38BDF8" />
            <text x={10} y={4} fill="#38BDF8" fontSize={10} fontWeight="black" className="uppercase tracking-widest">Création (Leads)</text>
            <circle cx={150} cy={0} r={4} fill="#4ADE80" />
            <text x={160} y={4} fill="#4ADE80" fontSize={10} fontWeight="black" className="uppercase tracking-widest">Protection (CA Sauvé)</text>
        </Group>

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="#ffffff10"
          tickStroke="#ffffff10"
          tickLabelProps={() => ({ fill: '#ffffff30', fontSize: 10, fontFamily: 'IBM Plex Mono', textAnchor: 'middle' })}
        />
        <AxisLeft
          scale={yScaleLeads}
          stroke="#38BDF820"
          tickStroke="#38BDF820"
          tickLabelProps={() => ({ fill: '#38BDF840', fontSize: 9, fontFamily: 'IBM Plex Mono' })}
        />
        <AxisLeft
          scale={yScaleCash}
          orientation="right"
          left={innerWidth}
          stroke="#4ADE8020"
          tickStroke="#4ADE8020"
          tickLabelProps={() => ({ fill: '#4ADE8040', fontSize: 9, fontFamily: 'IBM Plex Mono' })}
          tickFormat={d => `${d}k€`}
        />
      </Group>
    </svg>
  );
};

export function DualFlowVisx({ data }: { data: DualFlowPoint[] }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ParentSize>
        {({ width, height }) => <DualFlowInner data={data} width={width} height={height} />}
      </ParentSize>
    </div>
  );
}
