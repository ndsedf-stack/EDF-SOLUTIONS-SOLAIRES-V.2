import React from 'react';
import { Group } from '@visx/group';
import { LinePath } from '@visx/shape';
import { scaleLinear } from '@visx/scale';

export type DriftDatum = {
  day: number;        // 0 → 21
  active: number;
  silent: number;
  closing: number;
};

const COLORS = {
  active: '#38BDF8',   // Bleu institutionnel sourd
  silent: '#94A3B8',   // Gris neutre institutionnel
  closing: '#4ADE80',  // Vert institutionnel sourd
};

type Props = {
  data: DriftDatum[];
  width: number;
  height: number;
};

export const ClientDriftVisx: React.FC<Props> = ({ data, width, height }) => {
  const xScale = scaleLinear({
    domain: [0, 21],
    range: [0, width],
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map(d => Math.max(d.active, d.silent, d.closing)))],
    range: [height, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height} className="overflow-visible bg-[#0A0E27]">
      {/* Zone J+7 - Décrochage - Bordure ultra fine */}
      <rect
        x={xScale(7)}
        width={1.5}
        y={0}
        height={height}
        fill="#FF9F40"
        fillOpacity={0.3}
      />
      <rect
        x={xScale(7)}
        width={xScale(14) - xScale(7)}
        y={0}
        height={height}
        fill="#FF9F40"
        fillOpacity={0.05}
      />
      <text
        x={xScale(7) + 8}
        y={20}
        fill="#FF9F40"
        fontSize={10}
        fontWeight="bold"
        className="uppercase tracking-widest"
      >
        J+7 Décrochage
      </text>

      {/* Zone J+14 - Point de non-retour - Bordure ultra fine */}
      <rect
        x={xScale(14)}
        width={1.5}
        y={0}
        height={height}
        fill="#FF4757"
        fillOpacity={0.3}
      />
      <rect
        x={xScale(14) + 1.5}
        width={width - xScale(14) - 1.5}
        y={0}
        height={height}
        fill="#FF4757"
        fillOpacity={0.05}
      />
       <text
        x={xScale(14) + 8}
        y={20}
        fill="#FF4757"
        fontSize={10}
        fontWeight="bold"
        className="uppercase tracking-widest"
      >
        J+14 Non-retour
      </text>

      <Group>
        {/* Grille horizontale discrète */}
        {yScale.ticks(5).map(t => (
          <line
            key={t}
            x1={0}
            x2={width}
            y1={yScale(t)}
            y2={yScale(t)}
            stroke="white"
            strokeOpacity={0.05}
            strokeWidth={1}
          />
        ))}

        <LinePath
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.active)}
          stroke={COLORS.active}
          strokeWidth={1.5}
          strokeLinecap="round"
        />

        <LinePath
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.silent)}
          stroke={COLORS.silent}
          strokeWidth={1.5}
          strokeDasharray="6,4"
        />

        <LinePath
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.closing)}
          stroke={COLORS.closing}
          strokeWidth={1.5}
        />
      </Group>

      {/* Axe X de base */}
      <line
        x1={0}
        x2={width}
        y1={height}
        y2={height}
        stroke="white"
        strokeOpacity={0.1}
      />
    </svg>
  );
};
