import React from 'react';
import { Group } from '@visx/group';
import { BarStack } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { max } from 'd3-array';
import { AxisBottom, AxisLeft } from '@visx/axis';

export type RiskBarDatum = {
  date: string;
  secured: number;
  waiting: number;
  cancellable: number;
};

const COLORS = {
  secured: '#4ADE80',    // Green
  waiting: '#FB923C',    // Orange
  cancellable: '#F87171', // Red
};

type Props = {
  data: RiskBarDatum[];
  width: number;
  height: number;
};

export const FinancialRiskProofVisx: React.FC<Props> = ({ data, width, height }) => {
  const keys = ['secured', 'waiting', 'cancellable'];

  // ✅ AUDIT FIX ID: X_AXIS_OVERLOAD
  // Pattern: 'Sparse Temporal Axis' (1 label every 3 days)
  const filteredData = data.filter((_, i) => i % 3 === 0 || i === data.length - 1);
  const tickDates = filteredData.map(d => d.date);

  const xScale = scaleBand<string>({
    domain: data.map(d => d.date),
    padding: 0.2, 
  });

  const yScale = scaleLinear<number>({
    domain: [
      0,
      max(data, d => d.secured + d.waiting + d.cancellable) ?? 0,
    ],
    nice: true,
  });

  xScale.range([0, width]);
  yScale.range([height, 0]);

  // Threshold for "High Risk" context (e.g. 20% of max value)
  const riskThresholdY = yScale(yScale.domain()[1] * 0.2);

  return (
    <svg width={width} height={height} className="overflow-visible bg-[#0A0E27]">
      {/* ✅ AUDIT FIX ID: NO_RISK_ZONES -> Risk Skyline Pattern */}
      
      {/* 1. Safe Zone (Bottom) */}
      <rect
        x={0}
        y={riskThresholdY}
        width={width}
        height={height - riskThresholdY}
        fill="#4ADE80"
        fillOpacity={0.05}
      />
      
      {/* 2. Danger Zone (Top) */}
      <rect
        x={0}
        y={0}
        width={width}
        height={riskThresholdY}
        fill="#F87171"
        fillOpacity={0.05}
      />

      {/* Threshold Line */}
      <line
        x1={0}
        x2={width}
        y1={riskThresholdY}
        y2={riskThresholdY}
        stroke="#4ADE80"
        strokeWidth={1}
        strokeDasharray="4 4"
        strokeOpacity={0.5}
      />

      {/* ✅ AUDIT FIX ID: LEGEND_MISSING -> Contextual Legend Header */}
      <Group top={-25}>
        <text x={0} y={10} fill="#ffffff" fontSize={12} fontWeight="bold" fontFamily="IBM Plex Mono">
          RISQUE FINANCIER
        </text>
        <Group left={width - 200}>
           <rect x={0} y={0} width={8} height={8} fill={COLORS.secured} rx={2} />
           <text x={12} y={8} fill="#94A3B8" fontSize={10} fontFamily="IBM Plex Mono">SÉCURISÉ</text>
           
           <rect x={70} y={0} width={8} height={8} fill={COLORS.waiting} rx={2} />
           <text x={82} y={8} fill="#94A3B8" fontSize={10} fontFamily="IBM Plex Mono">EN ATTENTE</text>

           <rect x={150} y={0} width={8} height={8} fill={COLORS.cancellable} rx={2} />
           <text x={162} y={8} fill="#94A3B8" fontSize={10} fontFamily="IBM Plex Mono">CRITIQUE</text>
        </Group>
      </Group>

      <text
        x={width - 4}
        y={riskThresholdY - 6}
        textAnchor="end"
        fill="#4ADE80"
        fontSize={10}
        fontWeight="bold"
        className="uppercase tracking-wider"
        opacity={0.7}
      >
        SEUIL DE SÉCURITÉ (20%)
      </text>

      <Group>
        <BarStack<RiskBarDatum, string>
          data={data}
          keys={keys}
          x={d => d.date}
          xScale={xScale}
          yScale={yScale}
          color={key => COLORS[key as keyof typeof COLORS]}
        >
          {barStacks =>
            barStacks.map(stack =>
              stack.bars.map(bar => (
                <rect
                  key={`${bar.key}-${bar.index}`}
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={bar.color}
                  rx={2}
                  fillOpacity={0.9}
                />
              ))
            )
          }
        </BarStack>

        <AxisBottom
          top={height}
          scale={xScale}
          stroke="#ffffff10"
          tickStroke="#ffffff10"
          tickValues={tickDates}
          tickLabelProps={() => ({
            fill: '#ffffff40',
            fontSize: 10,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
          })}
          tickFormat={d => {
            const date = new Date(d);
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
          }}
        />
        <AxisLeft
          left={0}
          scale={yScale}
          stroke="#ffffff10"
          tickStroke="#ffffff10"
          tickLabelProps={() => ({
            fill: '#ffffff40',
            fontSize: 10,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'end',
            verticalAnchor: 'middle',
          })}
          tickFormat={d => `${Math.round((d as number) / 1000)}k`}
        />
      </Group>
    </svg>
  );
};
