import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { LinePath, AreaClosed } from '@visx/shape';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';

interface ProjectionPoint {
  date: Date;
  pessimistic: number;
  realistic: number;
  optimistic: number;
}

interface InternalProps {
  data: ProjectionPoint[];
  width: number;
  height: number;
}

const COLORS = {
  pessimistic: '#FB923C',
  realistic: '#38BDF8',
  optimistic: '#4ADE80',
  target: '#FFD700', // ✅ Gold for target
  area: 'rgba(56,189,248,0.12)',
  axis: '#ffffff10'
};

const ProjectionChart = ({ data, width, height }: InternalProps) => {
  const margin = { top: 20, right: 30, bottom: 40, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = scaleTime({
    domain: [data[0].date, data[data.length - 1].date],
    range: [0, innerWidth],
  });

  const maxValue = Math.max(...data.map(d => d.optimistic)) * 1.1 || 1000;
  const yScale = scaleLinear({
    domain: [0, maxValue],
    range: [innerHeight, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Zone d'incertitude — ✅ CORRECTION V13: Increased opacity */}
        <AreaClosed<ProjectionPoint>
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.optimistic)}
          yScale={yScale}
          fill={COLORS.area}
          fillOpacity={0.25}
          curve={curveMonotoneX}
        />

        {/* Ligne pessimiste — ✅ CORRECTION V12: Increased visibility */}
        <LinePath<ProjectionPoint>
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.pessimistic)}
          stroke={COLORS.pessimistic}
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeOpacity={0.9}
          curve={curveMonotoneX}
        />

        {/* Ligne réaliste */}
        <LinePath<ProjectionPoint>
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.realistic)}
          stroke={COLORS.realistic}
          strokeWidth={3}
          curve={curveMonotoneX}
        />

        {/* Ligne optimiste */}
        <LinePath<ProjectionPoint>
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.optimistic)}
          stroke={COLORS.optimistic}
          strokeWidth={1.5}
          curve={curveMonotoneX}
        />

        {/* ✅ CORRECTION V14: Add target objective line */}
        {data[0] && (
          <LinePath<ProjectionPoint>
            data={data}
            x={(d) => xScale(d.date)}
            y={() => yScale(data[0].realistic * 1.2)}
            stroke={COLORS.target}
            strokeWidth={2}
            strokeDasharray="8 4"
            strokeOpacity={0.7}
            curve={curveMonotoneX}
          />
        )}

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke={COLORS.axis}
          tickStroke={COLORS.axis}
          tickLabelProps={() => ({
            fill: '#ffffff40',
            fontSize: 11,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
          })}
        />
        <AxisLeft
          scale={yScale}
          stroke={COLORS.axis}
          tickStroke={COLORS.axis}
          tickLabelProps={() => ({
            fill: '#ffffff40',
            fontSize: 11,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'end',
            verticalAnchor: 'middle',
          })}
          tickFormat={d => `${Math.round(d as number / 1000)}k`}
        />
      </Group>
    </svg>
  );
};

export const ProjectionCAVISX = ({ data }: { data: ProjectionPoint[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[#0F1629] p-12 rounded-3xl border border-white/[0.05]">
      <div className="mb-10">
        <h2 className="text-white text-xl font-black uppercase tracking-widest mb-2">
          Projection de chiffre d'affaires — 90 jours
        </h2>
        <p className="text-white/40 text-sm font-medium italic">
          "Basée sur le pipeline réel, les conversions observées et le comportement post-signature."
        </p>
      </div>

      <div style={{ height: 360 }}>
        <ParentSize>
          {({ width, height }) => <ProjectionChart data={data} width={width} height={height} />}
        </ParentSize>
      </div>

      {/* ✅ CORRECTION V15: Highlight REALISTIC scenario */}
      <div className="grid grid-cols-3 gap-8 mt-12 bg-black/20 p-8 rounded-2xl border border-white/5">
        <div className="opacity-70">
          <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest block mb-2">Scénario Pessimiste</span>
          <p className="text-2xl font-black text-white tracking-tighter">
            {Math.round(data[data.length-1].pessimistic / 1000)}k€
          </p>
        </div>
        <div className="bg-sky-500/10 p-6 rounded-lg border border-sky-500/20">
          <span className="text-[11px] font-black text-sky-300 uppercase tracking-widest block mb-1">⭐ CIBLE RÉALISTE</span>
          <p className="text-5xl font-black text-sky-200 tracking-tighter">
            {Math.round(data[data.length-1].realistic / 1000)}k€
          </p>
        </div>
        <div className="opacity-70">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Scénario Optimiste</span>
          <p className="text-2xl font-black text-white tracking-tighter">
            {Math.round(data[data.length-1].optimistic / 1000)}k€
          </p>
        </div>
      </div>
    </div>
  );
};
