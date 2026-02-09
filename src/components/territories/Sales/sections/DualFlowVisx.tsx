import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { LinePath, AreaClosed } from '@visx/shape';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import { extent, max } from 'd3-array';
import { GridRows } from '@visx/grid';

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
  const margin = { top: 20, right: 80, bottom: 50, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleTime({
    domain: extent(data, d => d.date) as [Date, Date],
    range: [0, innerWidth],
  }), [data, innerWidth]);

  const yScaleLeads = useMemo(() => scaleLinear({
    domain: [0, max(data, d => d.leads) * 1.3 || 50],
    range: [innerHeight, 0],
  }), [data, innerHeight]);

  const yScaleCash = useMemo(() => scaleLinear({
    domain: [0, max(data, d => d.securedAfterRisk) * 1.3 || 100],
    range: [innerHeight, 0],
  }), [data, innerHeight]);

  return (
    <svg width={width} height={height}>
      <defs>
        {/* Gradients for premium look */}
        <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity={0.05} />
        </linearGradient>
        <linearGradient id="protectedGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#4ADE80" stopOpacity={0.05} />
        </linearGradient>
        
        {/* Glow filters */}
        <filter id="glowBlue">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="glowGreen">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <Group left={margin.left} top={margin.top}>
        {/* Subtle grid */}
        <GridRows 
          scale={yScaleLeads} 
          width={innerWidth} 
          stroke="white" 
          strokeOpacity={0.03}
          strokeDasharray="2,4"
        />

        {/* LEADS (Création) - Area */}
        <AreaClosed<DualFlowPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScaleLeads(d.leads)}
          yScale={yScaleLeads}
          fill="url(#leadsGradient)"
          curve={curveMonotoneX}
        />
        {/* LEADS - Line */}
        <LinePath<DualFlowPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScaleLeads(d.leads)}
          stroke="#38BDF8"
          strokeWidth={3}
          curve={curveMonotoneX}
          filter="url(#glowBlue)"
        />

        {/* SECURED (Protection) - Area */}
        <AreaClosed<DualFlowPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScaleCash(d.securedAfterRisk)}
          yScale={yScaleCash}
          fill="url(#protectedGradient)"
          curve={curveMonotoneX}
        />
        {/* SECURED - Line */}
        <LinePath<DualFlowPoint>
          data={data}
          x={d => xScale(d.date)}
          y={d => yScaleCash(d.securedAfterRisk)}
          stroke="#4ADE80"
          strokeWidth={3}
          curve={curveMonotoneX}
          filter="url(#glowGreen)"
        />

        {/* Legend - TOP RIGHT */}
        <Group top={10} left={innerWidth - 280}>
          <rect x={0} y={-5} width={280} height={40} fill="#0a0f1a" fillOpacity={0.8} rx={6} />
          
          {/* Création */}
          <circle cx={10} cy={8} r={5} fill="#38BDF8" />
          <text x={22} y={12} fill="#38BDF8" fontSize={11} fontWeight="600" fontFamily="IBM Plex Mono">
            CRÉATION (Leads)
          </text>
          
          {/* Protection */}
          <circle cx={10} cy={25} r={5} fill="#4ADE80" />
          <text x={22} y={29} fill="#4ADE80" fontSize={11} fontWeight="600" fontFamily="IBM Plex Mono">
            PROTECTION (CA Sauvé)
          </text>
        </Group>

        {/* Axes */}
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="rgba(255,255,255,0.1)"
          tickStroke="rgba(255,255,255,0.1)"
          tickLabelProps={() => ({ 
            fill: 'rgba(255,255,255,0.4)', 
            fontSize: 11, 
            fontFamily: 'IBM Plex Mono', 
            textAnchor: 'middle' 
          })}
        />
        
        {/* Left axis - Leads (Blue) */}
        <AxisLeft
          scale={yScaleLeads}
          stroke="rgba(56,189,248,0.2)"
          tickStroke="rgba(56,189,248,0.2)"
          tickLabelProps={() => ({ 
            fill: 'rgba(56,189,248,0.5)', 
            fontSize: 10, 
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'end'
          })}
        />
        
        {/* Right axis - CA (Green) */}
        <AxisLeft
          scale={yScaleCash}
          orientation="right"
          left={innerWidth}
          stroke="rgba(74,222,128,0.2)"
          tickStroke="rgba(74,222,128,0.2)"
          tickLabelProps={() => ({ 
            fill: 'rgba(74,222,128,0.5)', 
            fontSize: 10, 
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'start'
          })}
          tickFormat={d => `${d}k€`}
        />
      </Group>
    </svg>
  );
};

export function DualFlowVisx({ data }: { data: DualFlowPoint[] }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ParentSize>
        {({ width, height }) => <DualFlowInner data={data} width={width} height={height} />}
      </ParentSize>
    </div>
  );
}
