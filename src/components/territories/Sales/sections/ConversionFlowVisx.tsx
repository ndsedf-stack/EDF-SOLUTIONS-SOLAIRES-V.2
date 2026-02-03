import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { ParentSize } from '@visx/responsive';

export type ConversionStep = {
  step: string;
  value: number;
  color: string;
};

interface Props {
  data: ConversionStep[];
  width: number;
  height: number;
}

const ConversionFlowInner = ({ data, width, height }: Props) => {
  const margin = { top: 20, right: 30, bottom: 60, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleBand({
    domain: data.map(d => d.step),
    range: [0, innerWidth],
    padding: 0.3,
  }), [data, innerWidth]);

  const yScale = useMemo(() => scaleLinear({
    domain: [0, Math.max(...data.map(d => d.value)) * 1.1 || 100],
    range: [innerHeight, 0],
    nice: true,
  }), [data, innerHeight]);

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {data.map((d, i) => {
          const barWidth = xScale.bandwidth();
          const barHeight = innerHeight - yScale(d.value);
          const barX = xScale(d.step);
          const barY = innerHeight - barHeight;

          return (
            <Group key={`conv-bar-${d.step}`}>
              <Bar
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={d.color}
                fillOpacity={0.7}
                rx={8}
              />
              <text
                x={(barX || 0) + barWidth / 2}
                y={barY - 10}
                fill="white"
                fontSize={14}
                fontWeight="black"
                fontFamily="IBM Plex Mono"
                textAnchor="middle"
              >
                {d.value}
              </text>
              {i < data.length - 1 && (
                 <text
                    x={(barX || 0) + barWidth + (innerWidth / data.length) * 0.15}
                    y={barY + barHeight / 2}
                    fill="white"
                    opacity={0.2}
                    fontSize={10}
                    fontWeight="black"
                    textAnchor="middle"
                 >
                    {Math.round((data[i+1].value / d.value) * 100)}%
                 </text>
              )}
            </Group>
          );
        })}

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="#ffffff10"
          tickStroke="#ffffff10"
          tickLabelProps={() => ({
            fill: '#ffffff30',
            fontSize: 10,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
            fontWeight: 'bold'
          })}
        />
      </Group>
    </svg>
  );
};

export function ConversionFlowVisx({ data }: { data: ConversionStep[] }) {
  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ParentSize>
        {({ width, height }) => <ConversionFlowInner data={data} width={width} height={height} />}
      </ParentSize>
    </div>
  );
}
