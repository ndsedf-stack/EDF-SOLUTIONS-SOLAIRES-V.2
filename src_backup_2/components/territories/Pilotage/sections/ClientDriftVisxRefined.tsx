import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { LinePath, AreaClosed } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';

export type DriftPoint = {
  day: number;
  activeRate: number; // 0 à 100
};

interface Props {
  data: DriftPoint[];
  width: number;
  height: number;
}

const COLORS = {
  line: '#38BDF8',
  area: '#38BDF8',
  grid: '#ffffff05',
  axis: '#ffffff20',
  limit: '#F87171'
};

const ClientDriftInner = ({ data, width, height }: Props) => {
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleLinear({
    domain: [0, 14],
    range: [0, innerWidth],
  }), [innerWidth]);

  const yScale = useMemo(() => scaleLinear({
    domain: [0, 100],
    range: [innerHeight, 0],
    nice: true,
  }), [innerHeight]);

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Zones de danger */}
        <rect x={xScale(7)} y={0} width={xScale(14) - xScale(7)} height={innerHeight} fill="#ff0000" fillOpacity={0.03} />
        
        {/* Lignes de référence J+7 et J+14 */}
        <line x1={xScale(7)} y1={0} x2={xScale(7)} y2={innerHeight} stroke="#ffffff20" strokeDasharray="4,4" />
        <line x1={xScale(14)} y1={0} x2={xScale(14)} y2={innerHeight} stroke={COLORS.limit} strokeDasharray="4,4" opacity={0.5} />
        
        <text x={xScale(7)} y={-5} fill="#ffffff30" fontSize={10} fontFamily="IBM Plex Mono" textAnchor="middle">RDV DÉCOUPE (J+7)</text>
        <text x={xScale(14)} y={-5} fill={COLORS.limit} fontSize={10} fontFamily="IBM Plex Mono" textAnchor="middle" opacity={0.5}>CRITIQUE (J+14)</text>

        {/* Courbe active */}
        <AreaClosed<DriftPoint>
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.activeRate)}
          yScale={yScale}
          fill={COLORS.area}
          fillOpacity={0.1}
          curve={curveMonotoneX}
        />
        <LinePath<DriftPoint>
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.activeRate)}
          stroke={COLORS.line}
          strokeWidth={3}
          curve={curveMonotoneX}
        />

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke={COLORS.axis}
          tickStroke={COLORS.axis}
          label="JOURS POST-SIGNATURE"
          labelProps={{ fill: '#ffffff20', fontSize: 10, fontWeight: 'black', textAnchor: 'middle', letterSpacing: '0.2em' }}
          tickLabelProps={() => ({
            fill: '#ffffff30',
            fontSize: 10,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
          })}
          tickValues={[0, 2, 4, 6, 7, 8, 10, 12, 14]}
        />
        <AxisLeft
          scale={yScale}
          stroke={COLORS.axis}
          tickStroke={COLORS.axis}
          label="ADHÉSION (%)"
          labelProps={{ fill: '#ffffff20', fontSize: 10, fontWeight: 'black', textAnchor: 'middle', letterSpacing: '0.2em', angle: -90, dx: -40 }}
          tickLabelProps={() => ({
            fill: '#ffffff30',
            fontSize: 10,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'end',
            verticalAnchor: 'middle',
          })}
        />
      </Group>
    </svg>
  );
};

export function ClientDriftVisxRefined({ data }: { data: DriftPoint[] }) {
  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ParentSize>
        {({ width, height }) => <ClientDriftInner data={data} width={width} height={height} />}
      </ParentSize>
    </div>
  );
}
