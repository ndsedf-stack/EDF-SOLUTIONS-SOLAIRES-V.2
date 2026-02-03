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
  secured: '#4ADE80',
  waiting: '#FB923C',
  cancellable: '#F87171',
};

type Props = {
  data: RiskBarDatum[];
  width: number;
  height: number;
};

export const FinancialRiskProofVisx: React.FC<Props> = ({ data, width, height }) => {
  const keys = ['secured', 'waiting', 'cancellable'];

  // ✅ CORRECTION V1: Filter dates (1 every 7 days) for readability
  const filteredData = data.filter((_, i) => i % 7 === 0 || i === data.length - 1);
  const tickDates = filteredData.map(d => d.date);

  const xScale = scaleBand<string>({
    domain: data.map(d => d.date),
    padding: 0.2, // ✅ CORRECTION V2: Increased from 0.3 to make bars wider
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

  return (
    <svg width={width} height={height} className="overflow-visible bg-[#0A0E27]">
      {/* Seuil acceptable (20 %) - Zone shaded */}
      <rect
        x={0}
        y={yScale(yScale.domain()[1] * 0.2)}
        width={width}
        height={yScale(0) - yScale(yScale.domain()[1] * 0.2)}
        fill="#4ADE80"
        fillOpacity={0.08}
      />
      <line
        x1={0}
        x2={width}
        y1={yScale(yScale.domain()[1] * 0.2)}
        y2={yScale(yScale.domain()[1] * 0.2)}
        stroke="#4ADE80"
        strokeWidth={2}
        strokeOpacity={0.6}
      />
      <text
        x={width - 4}
        y={yScale(yScale.domain()[1] * 0.2) - 10}
        textAnchor="end"
        fill="#4ADE80"
        fontSize={11}
        fontWeight="bold"
        className="uppercase tracking-[0.2em]"
      >
        ✅ Zone acceptable (&lt;20%)
      </text>
      <text
        x={width - 4}
        y={yScale(yScale.domain()[1] * 0.08)}
        textAnchor="end"
        fill="#F87171"
        fontSize={11}
        fontWeight="bold"
        className="uppercase tracking-[0.2em]"
      >
        ⚠️ Risque élevé (&gt;20%)
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

        {/* ✅ CORRECTION V1: Axes with filtered dates */}
        <AxisBottom
          top={height}
          scale={xScale}
          stroke="#ffffff10"
          tickStroke="#ffffff10"
          tickValues={tickDates}
          tickLabelProps={() => ({
            fill: '#ffffff40',
            fontSize: 11,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
          })}
          tickFormat={d => {
            const date = new Date(d);
            return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
          }}
        />
        <AxisLeft
          left={0}
          scale={yScale}
          stroke="#ffffff10"
          tickStroke="#ffffff10"
          tickLabelProps={() => ({
            fill: '#ffffff40',
            fontSize: 11,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'end',
            verticalAnchor: 'middle',
          })}
          tickFormat={d => `${Math.round((d as number) / 1000)}k€`}
        />
      </Group>
    </svg>
  );
};
