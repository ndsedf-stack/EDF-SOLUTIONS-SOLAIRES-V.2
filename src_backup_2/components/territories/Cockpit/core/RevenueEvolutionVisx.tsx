import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { AreaStack, LinePath } from '@visx/shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { GridRows, GridColumns } from '@visx/grid';

interface DataPoint {
  date: Date;
  secured: number; // Vert
  signed: number;  // Cyan (Signé mais pas encore sécurisé)
  lost: number;    // Rouge (Annulé)
}

interface Props {
  data: DataPoint[];
  width: number;
  height: number;
}

const COLORS = {
  secured: '#10B981', // emerald-500
  signed: '#06B6D4',  // cyan-500
  lost: '#EF4444',    // red-500
  grid: '#ffffff05'
};

export const RevenueEvolutionVisx: React.FC<Props> = ({ data, width, height }) => {
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleTime({
    domain: [Math.min(...data.map(d => d.date.getTime())), Math.max(...data.map(d => d.date.getTime()))],
    range: [0, innerWidth],
  }), [data, innerWidth]);

  const yScale = useMemo(() => scaleLinear({
    domain: [0, Math.max(...data.map(d => d.secured + d.signed + d.lost)) * 1.1 || 1000],
    range: [innerHeight, 0],
    nice: true,
  }), [data, innerHeight]);

  const keys: (keyof DataPoint)[] = ['secured', 'signed', 'lost'];

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows scale={yScale} width={innerWidth} stroke={COLORS.grid} />
        <GridColumns scale={xScale} height={innerHeight} stroke={COLORS.grid} />
        
        <AreaStack
          data={data}
          keys={keys}
          x={d => xScale(d.data.date)}
          y0={d => yScale(d[0])}
          y1={d => yScale(d[1])}
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

        {/* Lignes de contour pour plus de netteté */}
        {keys.map(key => (
            <LinePath
                key={`line-${key}`}
                data={data}
                x={d => xScale(d.date)}
                y={d => yScale(d[key] as number)}
                stroke={COLORS[key as keyof typeof COLORS]}
                strokeWidth={1.5}
                curve={curveMonotoneX}
            />
        ))}

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke={COLORS.grid}
          tickStroke={COLORS.grid}
          tickLabelProps={() => ({
            fill: '#ffffff30',
            fontSize: 10,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
          })}
        />
        <AxisLeft
          scale={yScale}
          stroke={COLORS.grid}
          tickStroke={COLORS.grid}
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
