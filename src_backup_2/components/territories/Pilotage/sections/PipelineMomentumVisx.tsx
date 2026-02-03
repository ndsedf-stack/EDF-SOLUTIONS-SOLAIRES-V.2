import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { ParentSize } from '@visx/responsive';

export type PipelineStep = {
  stage: string;
  count: number;
  color: string;
};

interface Props {
  data: PipelineStep[];
  width: number;
  height: number;
}

const PipelineMomentumInner = ({ data, width, height }: Props) => {
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleBand({
    domain: data.map(d => d.stage),
    range: [0, innerWidth],
    padding: 0.4,
  }), [data, innerWidth]);

  const yScale = useMemo(() => scaleLinear({
    domain: [0, Math.max(...data.map(d => d.count)) * 1.1 || 100],
    range: [innerHeight, 0],
    nice: true,
  }), [data, innerHeight]);

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {data.map((d) => {
          const barWidth = xScale.bandwidth();
          const barHeight = innerHeight - yScale(d.count);
          const barX = xScale(d.stage);
          const barY = innerHeight - barHeight;

          return (
            <Group key={`bar-${d.stage}`}>
              <Bar
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={d.color}
                fillOpacity={0.8}
                rx={12}
              />
              <text
                x={(barX || 0) + barWidth / 2}
                y={barY - 10}
                fill="white"
                fontSize={12}
                fontWeight="black"
                fontFamily="IBM Plex Mono"
                textAnchor="middle"
              >
                {d.count}
              </text>
            </Group>
          );
        })}

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="#ffffff20"
          tickStroke="#ffffff20"
          tickLabelProps={() => ({
            fill: '#ffffff40',
            fontSize: 10,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
            fontWeight: 'bold',
            verticalAnchor: 'middle'
          })}
        />
        <AxisLeft
          scale={yScale}
          stroke="#ffffff20"
          tickStroke="#ffffff20"
          tickLabelProps={() => ({
            fill: '#ffffff40',
            fontSize: 9,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'end',
            verticalAnchor: 'middle',
          })}
        />
      </Group>
    </svg>
  );
};

export function PipelineMomentumVisx({ data }: { data: PipelineStep[] }) {
  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ParentSize>
        {({ width, height }) => <PipelineMomentumInner data={data} width={width} height={height} />}
      </ParentSize>
    </div>
  );
}
