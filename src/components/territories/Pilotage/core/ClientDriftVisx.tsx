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
      {/* Zone J+7 - Décrochage - Bordure Visible (High Contrast) */}
      <rect
        x={xScale(7)}
        width={3} // ✅ AUDIT FIX: Increased width
        y={0}
        height={height}
        fill="#FF9F40"
        fillOpacity={0.8} // ✅ AUDIT FIX: High Opacity
      />
      <rect
        x={xScale(7)}
        width={xScale(14) - xScale(7)}
        y={0}
        height={height}
        fill="#FF9F40"
        fillOpacity={0.1}
      />
      <line
        x1={xScale(7)}
        x2={xScale(7)}
        y1={0}
        y2={height}
        stroke="#FF9F40"
        strokeWidth={2}
        strokeDasharray="4 2"
      />
      <text
        x={xScale(7) + 8}
        y={20}
        fill="#FF9F40"
        fontSize={11}
        fontWeight="bold"
        className="uppercase tracking-widest font-mono"
      >
        ⚠️ RUPTURE SRU (J+7)
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

      {/* ✅ AUDIT FIX ID: LEGEND_MISSING */}
      <Group top={20} left={width - 150}>
         <rect x={0} y={0} width={8} height={8} fill={COLORS.active} rx={2} />
         <text x={12} y={8} fill="#94A3B8" fontSize={10} fontFamily="IBM Plex Mono">ACTIFS</text>
         
         <rect x={60} y={0} width={8} height={8} fill={COLORS.silent} rx={2} />
         <text x={72} y={8} fill="#94A3B8" fontSize={10} fontFamily="IBM Plex Mono">SILENCE</text>
      </Group>

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
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        <LinePath
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.silent)}
          stroke={COLORS.silent}
          strokeWidth={2.5}
          strokeDasharray="6,4"
        />

        <LinePath
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.closing)}
          stroke={COLORS.closing}
          strokeWidth={2.5}
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
