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
  // SVG Safety Check
  if (width < 10 || height < 10) return null;

  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const xScale = useMemo(() => scaleLinear({
    domain: [0, 14],
    range: [0, innerWidth],
  }), [innerWidth]);

  const yScale = useMemo(() => scaleLinear({
    domain: [0, 100],
    range: [innerHeight, 0],
    nice: true,
  }), [innerHeight]);

  const peakPoint = useMemo(() => {
    if (!data || !data.length) return null;
    return data.reduce((prev, current) => (prev.activeRate > current.activeRate) ? prev : current);
  }, [data]);

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {/* Zone critique churn (J+7 -> J+14) */}
        <rect 
          x={xScale(7)} 
          y={0} 
          width={Math.max(0, xScale(14) - xScale(7))} 
          height={innerHeight} 
          fill="#F59E0B" 
          fillOpacity={0.04} 
        />
        
        {/* Lignes de repère */}
        <line x1={xScale(7)} y1={0} x2={xScale(7)} y2={innerHeight} stroke="#F59E0B" strokeWidth={1} strokeDasharray="4,4" opacity={0.3} />
        <line x1={xScale(14)} y1={0} x2={xScale(14)} y2={innerHeight} stroke="#F87171" strokeWidth={1} strokeDasharray="4,4" opacity={0.3} />

        {/* Labels Zones */}
        <text 
          x={xScale(10.5)} 
          y={20} 
          fill="#F59E0B" 
          fontSize={10} 
          fontWeight="700" 
          textAnchor="middle" 
          className="uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
        >
          Zone critique churn
        </text>

        {/* Courbe active (Héros) */}
        <AreaClosed<DriftPoint>
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.activeRate)}
          yScale={yScale}
          fill={COLORS.area}
          fillOpacity={0.05}
          curve={curveMonotoneX}
        />
        <LinePath<DriftPoint>
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.activeRate)}
          stroke={COLORS.line}
          strokeWidth={4}
          strokeOpacity={0.9}
          curve={curveMonotoneX}
        />

        {/* Marqueur de Pic */}
        {peakPoint && (
          <Group>
            <circle 
              cx={xScale(peakPoint.day)} 
              cy={yScale(peakPoint.activeRate)} 
              r={5} 
              fill="#F87171" 
              className="animate-pulse"
            />
            <text 
              x={xScale(peakPoint.day)} 
              y={yScale(peakPoint.activeRate) - 15} 
              fill="#F87171" 
              fontSize={10} 
              fontWeight="bold" 
              textAnchor="middle"
              className="font-sans uppercase tracking-widest"
            >
              Pic décrochage
            </text>
          </Group>
        )}

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="transparent"
          tickStroke={COLORS.axis}
          tickLabelProps={() => ({
            fill: '#ffffff20',
            fontSize: 10,
            fontWeight: 'bold',
            className: 'font-sans',
            textAnchor: 'middle',
          })}
          tickValues={[0, 2, 4, 6, 8, 10, 12, 14]}
          tickFormat={v => `J+${v}`}
        />
        <AxisLeft
          scale={yScale}
          stroke="transparent"
          tickStroke={COLORS.axis}
          tickLabelProps={() => ({
            fill: '#ffffff20',
            fontSize: 10,
            fontWeight: 'bold',
            className: 'font-sans',
            textAnchor: 'end',
            verticalAnchor: 'middle',
            dx: -4
          })}
          tickValues={[0, 25, 50, 75, 100]}
          tickFormat={v => `${v}%`}
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
