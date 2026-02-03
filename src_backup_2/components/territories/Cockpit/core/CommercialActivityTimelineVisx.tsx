import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { BarStack } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';

interface ActivityData {
  date: string;
  studies: number;
  emails: number;
  decisions: number;
  actions: number;
}

interface Props {
  data: ActivityData[];
  width: number;
  height: number;
}

const COLORS = {
  studies: '#38BDF8',   // sky-400 (Activité système)
  emails: '#06B6D4',    // cyan-500
  decisions: '#F59E0B', // amber-500 (Friction / Décision)
  actions: '#10B981',   // emerald-500
  grid: '#ffffff05'
};

export const CommercialActivityTimelineVisx: React.FC<Props> = ({ data, width, height }) => {
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = scaleBand({
    domain: data.map(d => d.date),
    range: [0, innerWidth],
    padding: 0.2,
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => d.studies + d.emails + d.decisions + d.actions)) * 1.1 || 10],
    range: [innerHeight, 0],
    nice: true,
  });

  const keys: (keyof ActivityData)[] = ['studies', 'emails', 'decisions', 'actions'];

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <BarStack
          data={data}
          keys={keys}
          x={d => d.date}
          xScale={xScale}
          yScale={yScale}
          color={(key) => COLORS[key as keyof typeof COLORS]}
        >
          {barStacks => barStacks.map(barStack => (
            barStack.bars.map(bar => (
              <rect
                key={`bar-stack-${barStack.index}-${bar.index}`}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={bar.color}
                rx={1}
              />
            ))
          ))}
        </BarStack>

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke={COLORS.grid}
          tickStroke={COLORS.grid}
          tickLabelProps={() => ({
            fill: '#ffffff30',
            fontSize: 8,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
          })}
          tickFormat={d => d.split('-').slice(1).reverse().join('/')} // DD/MM
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
        />
      </Group>
    </svg>
  );
};
