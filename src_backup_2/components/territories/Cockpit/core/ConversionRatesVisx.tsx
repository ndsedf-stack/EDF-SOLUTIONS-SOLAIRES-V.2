import React from 'react';
import { Group } from '@visx/group';
import { BarGroup } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';

interface ConversionData {
  metric: string;
  without: number; // Taux sans automatisation
  with: number;    // Taux avec automatisation
}

interface Props {
  data: ConversionData[];
  width: number;
  height: number;
}

const COLORS = {
  without: '#ffffff20',
  with: '#10B981', // emerald-500
  grid: '#ffffff05'
};

export const ConversionRatesVisx: React.FC<Props> = ({ data, width, height }) => {
  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = scaleBand({
    domain: data.map(d => d.metric),
    range: [0, innerWidth],
    padding: 0.2,
  });

  const xSubScale = scaleBand({
    domain: ['without', 'with'],
    range: [0, xScale.bandwidth()],
    padding: 0.1,
  });

  const yScale = scaleLinear({
    domain: [0, 100], // Toujours en pourcentage
    range: [innerHeight, 0],
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <BarGroup
          data={data}
          keys={['without', 'with']}
          height={innerHeight}
          x0={d => d.metric}
          x0Scale={xScale}
          x1Scale={xSubScale}
          yScale={yScale}
          color={(key) => COLORS[key as keyof typeof COLORS]}
        >
          {barGroups => barGroups.map(barGroup => (
            <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={barGroup.x0}>
              {barGroup.bars.map(bar => (
                <rect
                  key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                  x={bar.x}
                  y={bar.y}
                  width={bar.width}
                  height={bar.height}
                  fill={COLORS[bar.key as keyof typeof COLORS]}
                  rx={2}
                />
              ))}
            </Group>
          ))}
        </BarGroup>

        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke={COLORS.grid}
          tickStroke={COLORS.grid}
          tickLabelProps={() => ({
            fill: '#ffffff30',
            fontSize: 9,
            fontFamily: 'Manrope',
            fontWeight: 'bold',
            textAnchor: 'middle',
          })}
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
          tickFormat={d => `${d}%`}
        />
      </Group>
    </svg>
  );
};
