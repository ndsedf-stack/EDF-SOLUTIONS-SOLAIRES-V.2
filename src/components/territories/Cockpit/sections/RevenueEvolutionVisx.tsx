import React, { useMemo } from 'react';
import { AreaStack } from '@visx/shape';
import { scaleLinear, scaleTime } from '@visx/scale';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';

interface DataPoint {
  date: Date;
  secured: number;
  signed: number;
  cancelled: number;
}

interface InternalProps {
  data: DataPoint[];
  width: number;
  height: number;
}

const COLORS = {
  secured: '#10B981',
  signed: '#06B6D4',
  cancelled: '#EF4444',
  axis: '#ffffff10'
};

const RevenueChart = ({ data, width, height }: InternalProps) => {
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = scaleTime({
    domain: [data[0].date, data[data.length - 1].date],
    range: [0, innerWidth],
  });

  const maxTotal = Math.max(...data.map(d => d.secured + d.signed + d.cancelled)) * 1.1 || 1000;
  const yScale = scaleLinear({
    domain: [0, maxTotal],
    range: [innerHeight, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <AreaStack
          data={data}
          keys={['secured', 'signed', 'cancelled']}
          x={(d) => xScale(d.data.date)}
          y0={(d) => yScale(d[0])}
          y1={(d) => yScale(d[1])}
          curve={curveMonotoneX}
        >
          {({ stacks, path }) => stacks.map(stack => (
            <path
              key={`stack-${stack.key}`}
              d={path(stack) || ''}
              fill={COLORS[stack.key as keyof typeof COLORS]}
              fillOpacity={0.6}
            />
          ))}
        </AreaStack>
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

export const RevenueEvolutionVisx = ({ data }: { data: DataPoint[] }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-[#0F1629] p-12 rounded-3xl border border-white/[0.05]">
      <div className="mb-8">
        <h3 className="text-white font-black uppercase tracking-widest text-xs mb-1">
          Évolution du chiffre d’affaires
        </h3>
        <p className="text-[11px] text-white/30 italic">"Est-ce que l'argent rentre réellement ?"</p>
      </div>

      <div style={{ height: 320 }}>
        <ParentSize>
          {({ width, height }) => <RevenueChart data={data} width={width} height={height} />}
        </ParentSize>
      </div>
    </div>
  );
};
