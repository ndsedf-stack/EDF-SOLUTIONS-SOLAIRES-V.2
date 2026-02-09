import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { ParentSize } from '@visx/responsive';
import { Text } from '@visx/text';

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
  const margin = { top: 40, right: 60, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Horizontal Scale: using a square root scale to prevent small values from becoming invisible
  const maxCount = Math.max(...data.map(d => d.count));
  const minBarWidth = 40; // Minimum width in pixels
  const xScale = useMemo(() => scaleLinear({
    domain: [0, maxCount],
    range: [minBarWidth, innerWidth],
  }), [maxCount, innerWidth]);

  const yScale = useMemo(() => scaleBand({
    domain: data.map(d => d.stage),
    range: [0, innerHeight],
    paddingInner: 0.6,
    paddingOuter: 0.2,
  }), [data, innerHeight]);

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {data.map((d, i) => {
          const barHeight = yScale.bandwidth();
          const barWidth = xScale(d.count);
          const barX = (innerWidth - barWidth) / 2;
          const barY = yScale(d.stage) || 0;
          
          const nextStep = data[i+1];
          const conversionRatio = nextStep ? Math.round((nextStep.count / d.count) * 100) : null;

          return (
            <Group key={`step-${d.stage}`}>
              {/* SHADOW / BACKGROUND BOX */}
              <Bar
                x={0}
                y={barY}
                width={innerWidth}
                height={barHeight}
                fill="white"
                fillOpacity={0.02}
                rx={8}
              />

              {/* ACTIVE BAR */}
              <Bar
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={d.color}
                fillOpacity={0.7}
                rx={6}
                className="transition-all duration-500 ease-in-out"
              />
              
              {/* LABEL: STAGE (LEFT ALIGNED TO CLEAR CENTER) */}
              <Text
                x={0}
                y={barY + barHeight / 2}
                fill="white"
                fillOpacity={0.4}
                fontSize={10}
                fontWeight="black"
                className="font-sans uppercase tracking-[0.2em]"
                textAnchor="start"
                verticalAnchor="middle"
              >
                {d.stage}
              </Text>

              {/* VALUE (INSIDE BAR) */}
              <Text
                x={innerWidth / 2}
                y={barY + barHeight / 2}
                fill="white"
                fontSize={18}
                fontWeight="black"
                className="font-mono tabular-nums"
                textAnchor="middle"
                verticalAnchor="middle"
              >
                {d.count.toLocaleString()}
              </Text>

              {/* CONVERSION RATIO (BETWEEN STEPS) */}
              {conversionRatio !== null && (
                <Group>
                  {/* Dotted connector */}
                  <line 
                    x1={innerWidth / 2} 
                    y1={barY + barHeight} 
                    x2={innerWidth / 2} 
                    y2={barY + barHeight + (yScale.step() * yScale.paddingInner())} 
                    stroke="white" 
                    strokeOpacity={0.1} 
                    strokeDasharray="2,2" 
                  />
                  
                  <rect 
                    x={innerWidth / 2 - 25} 
                    y={barY + barHeight + (yScale.step() * yScale.paddingInner()) / 2 - 9} 
                    width={50} 
                    height={18} 
                    rx={9} 
                    fill="#101827" 
                    stroke={d.color} 
                    strokeOpacity={0.4} 
                  />
                  
                  <Text
                    x={innerWidth / 2}
                    y={barY + barHeight + (yScale.step() * yScale.paddingInner()) / 2 - 1}
                    fill={d.color}
                    fontSize={9}
                    fontWeight="black"
                    className="font-mono"
                    textAnchor="middle"
                    verticalAnchor="middle"
                  >
                    {`${conversionRatio}%`}
                  </Text>
                </Group>
              )}
            </Group>
          );
        })}
      </Group>
    </svg>
  );
};

export function PipelineMomentumVisx({ data }: { data: PipelineStep[] }) {
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ParentSize>
        {({ width, height }) => <PipelineMomentumInner data={data} width={width} height={height} />}
      </ParentSize>
    </div>
  );
}
