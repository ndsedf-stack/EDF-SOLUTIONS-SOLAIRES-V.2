import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom } from '@visx/axis';
import { ParentSize } from '@visx/responsive';

export type RevenuePoint = {
  label: string;
  value: number;
  target?: number;
};

interface Props {
  data: RevenuePoint[];
  autopilotIndex: number;
  width: number;
  height: number;
}

const TrajectoryRevenueInner = ({ data, autopilotIndex, width, height }: Props) => {
  const margin = { top: 40, right: 30, bottom: 40, left: 30 };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const xScale = useMemo(() => scaleBand({
    domain: data.map(d => d.label),
    range: [0, innerWidth],
    padding: 0.3,
  }), [data, innerWidth]);

  const maxVal = Math.max(...data.map(d => Math.max(d.value, d.target || 0)), 1);
  const yScale = useMemo(() => scaleLinear({
    domain: [0, maxVal * 1.1],
    range: [innerHeight, 0],
  }), [maxVal, innerHeight]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* SHADOW GRADIENT DEF */}
      <defs>
        <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#059669" stopOpacity={0.3} />
        </linearGradient>
      </defs>

      <Group left={margin.left} top={margin.top}>
        {/* TARGET LINE (PROJECTIVE) */}
        <Group>
           {data.map((d, i) => {
             if (i === 0 || !d.target) return null;
             const prev = data[i-1];
             if (!prev.target) return null;
             return (
               <line 
                  key={`target-line-${i}`}
                  x1={(xScale(prev.label) || 0) + xScale.bandwidth()/2}
                  y1={yScale(prev.target)}
                  x2={(xScale(d.label) || 0) + xScale.bandwidth()/2}
                  y2={yScale(d.target)}
                  stroke="white"
                  strokeOpacity={0.15}
                  strokeWidth={1}
                  strokeDasharray="4,4"
               />
             );
           })}
        </Group>

        {/* AUTOPILOT MARKER */}
        {autopilotIndex < data.length && (
           <Group left={xScale(data[autopilotIndex].label) || 0}>
              <line 
                 y1={-20} 
                 y2={innerHeight} 
                 stroke="white" 
                 strokeOpacity={0.2} 
                 strokeWidth={1} 
                 strokeDasharray="4,2" 
              />
              <text 
                 y={-25} 
                 fill="white" 
                 opacity={0.3} 
                 fontSize={8} 
                 fontWeight="black" 
                 className="uppercase tracking-widest text-[7px]"
              >
                 Démarrage Autopilote
              </text>
        </Group>
        )}

        {data.map((d, i) => {
          const barWidth = xScale.bandwidth();
          const barX = xScale(d.label) || 0;
          const barY = yScale(d.value);
          const barHeight = Math.max(2, innerHeight - barY);
          const isAfter = i >= autopilotIndex;

          return (
            <Group key={`revenue-bar-${i}`}>
              {/* ACCELERATION BAR */}
              <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={isAfter ? "url(#emeraldGradient)" : "white"}
                fillOpacity={isAfter ? 0.9 : 0.15}
                rx={4}
                className="transition-all duration-500"
              />
              {/* Value Label */}
              <text
                x={barX + barWidth / 2}
                y={barY - 8}
                fill="white"
                opacity={isAfter ? 1 : 0.3}
                fontSize={9}
                fontWeight="black"
                fontFamily="IBM Plex Mono"
                textAnchor="middle"
              >
                {Math.round(d.value / 1000)}k
              </text>
            </Group>
          );
        })}

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="transparent"
          tickStroke="transparent"
          tickLabelProps={() => ({
            fill: '#ffffff20',
            fontSize: 9,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
            fontWeight: 'bold',
            className: 'uppercase tracking-[0.2em]'
          })}
        />
      </Group>
    </svg>
  );
};

export function TrajectoryRevenueVisx({ data, autopilotIndex }: { data: RevenuePoint[], autopilotIndex: number }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ width: '100%', height: '280px' }}>
      <ParentSize>
        {({ width, height }) => (
          <TrajectoryRevenueInner data={data} autopilotIndex={autopilotIndex} width={width} height={height} />
        )}
      </ParentSize>
    </div>
  );
}
