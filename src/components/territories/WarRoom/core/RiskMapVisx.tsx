import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { Circle } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { ParentSize } from '@visx/responsive';
import { extent } from 'd3-array';

export type WarRoomPoint = {
  studyId: string;
  name: string;
  daysBeforeDeadline: number;
  totalPrice: number;
  dangerScore: number;
  engagementScore: number;
};

export interface RiskMapProps {
  studies: WarRoomPoint[];
  onPointClick?: (studyId: string) => void;
}

interface RiskMapInnerProps extends RiskMapProps {
  width: number;
  height: number;
}

const COLORS = {
  low: '#4ADE80',
  medium: '#FB923C',
  high: '#F87171',
  axis: '#ffffff10'
};

const RiskMapInner = ({ studies, width, height, onPointClick }: RiskMapInnerProps) => {
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleLinear({
    domain: [0, Math.max(14, ...studies.map(d => d.daysBeforeDeadline))],
    range: [innerWidth, 0], // Inversé : 0 jours (danger) à droite
  }), [studies, innerWidth]);

  const yScale = useMemo(() => scaleLinear({
    domain: [0, max(studies, d => d.totalPrice) || 50000] as [number, number],
    range: [innerHeight, 0],
    nice: true,
  }), [studies, innerHeight]);

  const sizeScale = useMemo(() => scaleLinear({
    domain: [0, 100],
    range: [8, 30],
  }), []);

  const colorScale = (score: number) => {
    if (score < 40) return COLORS.low;
    if (score < 70) return COLORS.medium;
    return COLORS.high;
  };

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Grilles discrètes */}
        <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke={COLORS.axis} />
        <line x1={0} y1={0} x2={0} y2={innerHeight} stroke={COLORS.axis} />

        {studies.map((study) => (
          <Circle
            key={study.studyId}
            cx={xScale(study.daysBeforeDeadline)}
            cy={yScale(study.totalPrice)}
            r={sizeScale(study.engagementScore)}
            fill={colorScale(study.dangerScore)}
            fillOpacity={0.4}
            stroke={colorScale(study.dangerScore)}
            strokeWidth={2}
            className="cursor-pointer hover:fill-opacity-80 transition-all hover:r-30"
            onClick={() => onPointClick && onPointClick(study.studyId)}
          >
             <title>{`${study.name}: ${Math.round(study.totalPrice / 1000)}k€ - ${study.daysBeforeDeadline}j`}</title>
          </Circle>
        ))}

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke={COLORS.axis}
          tickStroke={COLORS.axis}
          label="JOURS AVANT DEADLINE (MOMENTUM)"
          labelProps={{ fill: '#ffffff20', fontSize: 10, fontWeight: 'black', textAnchor: 'middle', letterSpacing: '0.2em' }}
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
          label="VALEUR FINANCIÈRE (€)"
          labelProps={{ fill: '#ffffff20', fontSize: 10, fontWeight: 'black', textAnchor: 'middle', letterSpacing: '0.2em', angle: -90, dx: -40 }}
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

function max<T>(data: T[], value: (d: T) => number): number {
    return data.reduce((acc, d) => Math.max(acc, value(d)), 0);
}

export function RiskMapVisx({ studies, onPointClick }: RiskMapProps) {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ParentSize>
        {({ width, height }) => <RiskMapInner studies={studies} width={width} height={height} onPointClick={onPointClick} />}
      </ParentSize>
    </div>
  );
}
