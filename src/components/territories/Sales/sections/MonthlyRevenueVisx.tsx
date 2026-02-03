import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { LinePath, AreaClosed } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';

export type RevenueMonth = {
  month: string;
  revenue: number;
};

interface Props {
  data: RevenueMonth[];
  width: number;
  height: number;
}

const MonthlyRevenueInner = ({ data, width, height }: Props) => {
  const margin = { top: 20, right: 30, bottom: 50, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(() => scaleBand({
    domain: data.map(d => d.month),
    range: [0, innerWidth],
    padding: 0,
  }), [data, innerWidth]);

  const yScale = useMemo(() => scaleLinear({
    domain: [0, Math.max(...data.map(d => d.revenue)) * 1.2 || 1000000],
    nice: true,
    range: [innerHeight, 0],
  }), [data, innerHeight]);

  const getX = (d: RevenueMonth) => (xScale(d.month) || 0) + xScale.bandwidth() / 2;

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <AreaClosed<RevenueMonth>
          data={data}
          x={getX}
          y={d => yScale(d.revenue)}
          yScale={yScale}
          fill="#38BDF8"
          fillOpacity={0.1}
          curve={curveMonotoneX}
        />
        <LinePath<RevenueMonth>
          data={data}
          x={getX}
          y={d => yScale(d.revenue)}
          stroke="#38BDF8"
          strokeWidth={3}
          curve={curveMonotoneX}
        />
        
        {/* Point de bascule Autopilote (Simulé) */}
        {data.length > 3 && (
            <Group>
                <line 
                    x1={getX(data[data.length - 4])} 
                    y1={0} 
                    x2={getX(data[data.length - 4])} 
                    y2={innerHeight} 
                    stroke="white" 
                    strokeDasharray="4,4" 
                    opacity={0.3} 
                />
                <text 
                    x={getX(data[data.length - 4]) + 10} 
                    y={20} 
                    fill="white" 
                    fontSize={9} 
                    fontWeight="black" 
                    className="uppercase tracking-[0.2em] opacity-30"
                >
                    Activation Autopilote
                </text>
            </Group>
        )}

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
          })}
        />
        <AxisLeft
          scale={yScale}
          stroke="#ffffff10"
          tickStroke="#ffffff10"
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

export function MonthlyRevenueVisx({ data }: { data: RevenueMonth[] }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ParentSize>
        {({ width, height }) => <MonthlyRevenueInner data={data} width={width} height={height} />}
      </ParentSize>
    </div>
  );
}
