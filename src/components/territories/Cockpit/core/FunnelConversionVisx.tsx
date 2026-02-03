import React from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleBand } from '@visx/scale';

import { Text } from '@visx/text';

interface FunnelStep {
  label: string;
  value: number;
}

interface Props {
  data: FunnelStep[];
  width: number;
  height: number;
}

const COLORS = {
  bar: '#06B6D4', // cyan-500
  text: '#ffffff80',
  grid: '#ffffff05'
};

export const FunnelConversionVisx: React.FC<Props> = ({ data, width, height }) => {
  const margin = { top: 20, right: 100, bottom: 20, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxValue = Math.max(...data.map(d => d.value)) || 1;
  
  const yScale = scaleBand({
    domain: data.map(d => d.label),
    range: [0, innerHeight],
    padding: 0.3,
  });

  const xScale = scaleLinear({
    domain: [0, maxValue],
    range: [0, innerWidth],
  });

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        {data.map((d, i) => {
          const barWidth = xScale(d.value);
          const barHeight = yScale.bandwidth();
          const barX = (innerWidth - barWidth) / 2;
          const barY = yScale(d.label) || 0;

          return (
            <Group key={`step-${d.label}`}>
              {/* Rectangle Proportionnel (Centré) */}
              <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={COLORS.bar}
                fillOpacity={0.1 + (i * 0.2)} // De plus en plus opaque
                stroke={COLORS.bar}
                strokeWidth={1}
                rx={4}
              />
              
              {/* Label Gauche */}
              <Text
                x={-10}
                y={barY + barHeight / 2}
                fill={COLORS.text}
                fontSize={10}
                fontFamily="Manrope"
                fontWeight="bold"
                textAnchor="end"
                verticalAnchor="middle"
                className="uppercase tracking-widest"
              >
                {d.label}
              </Text>

              {/* Valeur Droite */}
              <Text
                x={innerWidth + 10}
                y={barY + barHeight / 2}
                fill="white"
                fontSize={12}
                fontFamily="IBM Plex Mono"
                fontWeight="black"
                textAnchor="start"
                verticalAnchor="middle"
              >
                {String(d.value)}
              </Text>

              {/* Pourcentage de déperdition par rapport à l'étape précédente */}
              {i > 0 && (
                  <Text
                    x={innerWidth / 2}
                    y={barY - 5}
                    fill="#ffffff30"
                    fontSize={9}
                    fontFamily="IBM Plex Mono"
                    textAnchor="middle"
                  >
                    {`${Math.round((d.value / data[i-1].value) * 100)}% de conversion`}
                  </Text>
              )}
            </Group>
          );
        })}
      </Group>
    </svg>
  );
};
