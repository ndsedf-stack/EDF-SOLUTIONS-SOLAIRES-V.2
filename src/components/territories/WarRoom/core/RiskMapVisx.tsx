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
  width: number;
  height: number;
  onPointClick?: (studyId: string) => void;
}

const RiskMapInner = ({ studies, width, height, onPointClick }: RiskMapProps) => {
  // ... existing code ...

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

export function RiskMapVisx({ studies }: { studies: WarRoomPoint[] }) {
  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ParentSize>
        {({ width, height }) => <RiskMapInner studies={studies} width={width} height={height} />}
      </ParentSize>
    </div>
  );
}
