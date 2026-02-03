import React from 'react';
import { Group } from '@visx/group';
import { BarStack } from '@visx/shape';
import { scaleLinear, scaleBand } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { ParentSize } from '@visx/responsive';

interface DriftPoint {
  day: string;
  stable: number;
  muted: number;
  agitated: number;
  critical: number;
}

interface InternalProps {
  data: DriftPoint[];
  width: number;
  height: number;
}

const COLORS = {
  stable: '#4ADE80',
  muted: '#FB923C',
  agitated: '#F97316',
  critical: '#F87171',
  axis: '#ffffff10'
};

const DriftChart = ({ data, width, height }: InternalProps) => {
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // ✅ CORRECTION V6: Filter to key days only
  const keyDays = ['0', '3', '7', '10', '14'];
  const filteredData = data.filter(d => keyDays.includes(d.day));

  const xScale = scaleBand({
    domain: filteredData.map(d => d.day),
    range: [0, innerWidth],
    padding: 0.1, // ✅ Increased from 0.2 to make bars wider
  });

  const maxValue = Math.max(...filteredData.map(d => d.stable + d.muted + d.agitated + d.critical)) * 1.1 || 10;
  const yScale = scaleLinear({
    domain: [0, maxValue],
    range: [innerHeight, 0],
    nice: true,
  });

  const keys: (keyof DriftPoint)[] = ['stable', 'muted', 'agitated', 'critical'];

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        
        {/* ✅ CORRECTION V8: Add J+7 rupture marker */}
        {filteredData.find(d => d.day === '7') && (
          <>
            <line
              x1={xScale('7')! + xScale.bandwidth() / 2}
              x2={xScale('7')! + xScale.bandwidth() / 2}
              y1={0}
              y2={innerHeight}
              stroke="#FB923C"
              strokeWidth={2}
              strokeDasharray="6 4"
              strokeOpacity={0.5}
            />
            <text
              x={xScale('7')! + xScale.bandwidth() / 2}
              y={-8}
              fill="#FB923C"
              fontSize={10}
              fontWeight="bold"
              textAnchor="middle"
              className="uppercase tracking-[0.2em]"
            >
              ⚠️ Rupture imminente
            </text>
          </>
        )}

        <BarStack
          data={filteredData}
          keys={keys}
          x={(d) => d.day}
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
                rx={2}
              />
            ))
          ))}
        </BarStack>
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke={COLORS.axis}
          tickStroke={COLORS.axis}
          tickLabelProps={() => ({
            fill: '#ffffff40',
            fontSize: 11,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
          })}
          tickFormat={d => `J+${d}`}
        />
        <AxisLeft
          scale={yScale}
          stroke={COLORS.axis}
          tickStroke={COLORS.axis}
          tickLabelProps={() => ({
            fill: '#ffffff40',
            fontSize: 11,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'end',
            verticalAnchor: 'middle',
          })}
        />
      </Group>
    </svg>
  );
};

export const ClientDriftVisx = ({ data }: { data: DriftPoint[] }) => {
  return (
    <div className="bg-[#0F1629] p-12 rounded-3xl border border-white/[0.05]">
      <div className="mb-8">
        <h3 className="text-white text-lg font-black uppercase tracking-widest mb-1">
          Drift client post-signature
        </h3>
        <p className="text-white/40 text-sm font-medium italic">
          Distribution comportementale J+0 → J+14. Détection des zones de rupture invisible.
        </p>
      </div>

      <div style={{ height: 280 }}>
        <ParentSize>
          {({ width, height }) => <DriftChart data={data} width={width} height={height} />}
        </ParentSize>
      </div>
      
      <div className="flex gap-8 mt-10 justify-center">
         <LegendItem color={COLORS.stable} label="Stable" />
         <LegendItem color={COLORS.muted} label="Silencieux" />
         <LegendItem color={COLORS.agitated} label="Agité" />
         <LegendItem color={COLORS.critical} label="Critique" />
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }: any) => (
    <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</span>
    </div>
);
