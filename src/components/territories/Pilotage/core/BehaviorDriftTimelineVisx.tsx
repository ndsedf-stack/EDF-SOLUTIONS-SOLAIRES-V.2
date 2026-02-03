import React from 'react';
import { Group } from '@visx/group';
import { LinePath, AreaClosed } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';

/**
 * 📈 BehaviorDriftTimelineVisx
 * Répond à : "À partir de quand un client bascule vers l'annulation ?"
 * Doctrine : Révélation d'une loi cachée. Volumes crédibles (€ / dossiers).
 */

export interface DriftMetrics {
  day: number;          // J+0 → J+30
  active: number;       // dossiers engagés
  silent: number;       // silence >72h
  refused: number;      // refus explicites
}

interface Props {
  data: DriftMetrics[];
  width: number;
  height: number;
}

const COLORS = {
  active: '#4ADE80',   // Vert (Vie/Engagé)
  silent: '#FB923C',   // Orange (Tension)
  refused: '#F87171',  // Rouge (Perte)
  bg: '#0A0E27'
};

export const BehaviorDriftTimelineVisx: React.FC<Props> = ({ data, width, height }) => {
  const margin = { top: 40, right: 40, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = scaleLinear({
    domain: [0, 30],
    range: [0, innerWidth],
  });

  const maxVal = Math.max(...data.map(d => Math.max(d.active, d.silent, d.refused)), 10);
  const yScale = scaleLinear({
    domain: [0, maxVal],
    range: [innerHeight, 0],
    nice: true,
  });

  return (
    <div className="relative">
      <svg width={width} height={height} className="bg-[#0A0E27]">
        <Group left={margin.left} top={margin.top}>
          
          {/* ZONES CAUSALES (FOND) */}
          {/* Zone 🟢 J0-J7 : Récupérable */}
          <rect
            x={xScale(0)}
            width={xScale(7) - xScale(0)}
            y={0}
            height={innerHeight}
            fill={COLORS.active}
            fillOpacity={0.03}
          />
          
          {/* Zone 🟠 J7-J14 : Tension */}
          <rect
            x={xScale(7)}
            width={xScale(14) - xScale(7)}
            y={0}
            height={innerHeight}
            fill={COLORS.silent}
            fillOpacity={0.05}
          />

          {/* Zone 🔴 J14+ : Critique */}
          <rect
            x={xScale(14)}
            width={xScale(30) - xScale(14)}
            y={0}
            height={innerHeight}
            fill={COLORS.refused}
            fillOpacity={0.08}
          />

          {/* AXES IBM PLEX MONO */}
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
            tickValues={[0, 7, 14, 21, 30]}
            tickFormat={d => `J+${d}`}
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
          />

          {/* COURBES DE LOI */}
          {/* COURBES DE LOI */}
          
          {/* ✅ AUDIT FIX ID: NO_THRESHOLDS -> Seuils Critiques */}
          <line
            x1={0}
            x2={innerWidth}
            y1={yScale(maxVal * 0.4)}
            y2={yScale(maxVal * 0.4)}
            stroke="#F87171"
            strokeWidth={1}
            strokeDasharray="2 2"
            strokeOpacity={0.4}
          />
          <text x={innerWidth - 10} y={yScale(maxVal * 0.4) - 4} fill="#F87171" fontSize={9} textAnchor="end" className="uppercase tracking-widest opacity-70">
            SEUIL ALERTE (40%)
          </text>

          {/* Actifs */}
          <LinePath
            data={data}
            x={d => xScale(d.day)}
            y={d => yScale(d.active)}
            stroke={COLORS.active}
            strokeWidth={2}
            curve={curveMonotoneX}
          />
          
          {/* ✅ AUDIT FIX ID: SILENT_LINE_INVISIBLE -> Ruban de Tendance (Ribbon) */}
          <AreaClosed
            data={data}
            x={d => xScale(d.day)}
            y={d => yScale(d.silent)}
            yScale={yScale}
            fill={COLORS.silent}
            fillOpacity={0.15} // Visible ribbon
            curve={curveMonotoneX}
          />
          <LinePath
            data={data}
            x={d => xScale(d.day)}
            y={d => yScale(d.silent)}
            stroke={COLORS.silent}
            strokeWidth={3} // Thicker
            strokeDasharray="4 4" // Tighter dash
            strokeOpacity={1}
            curve={curveMonotoneX}
          />

          {/* Refus */}
          <AreaClosed
            data={data}
            x={d => xScale(d.day)}
            y={d => yScale(d.refused)}
            yScale={yScale}
            fill={COLORS.refused}
            fillOpacity={0.1}
            curve={curveMonotoneX}
          />
          <LinePath
            data={data}
            x={d => xScale(d.day)}
            y={d => yScale(d.refused)}
            stroke={COLORS.refused}
            strokeWidth={2}
            curve={curveMonotoneX}
          />

          {/* LABELS DE ZONES */}
          <text x={xScale(3.5)} y={-10} fill={COLORS.active} fontSize={9} fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest opacity-50">Récupérable</text>
          <text x={xScale(10.5)} y={-10} fill={COLORS.silent} fontSize={9} fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest opacity-50">Tension</text>
          <text x={xScale(22)} y={-10} fill={COLORS.refused} fontSize={9} fontWeight="bold" textAnchor="middle" className="uppercase tracking-widest opacity-50">Critique</text>

        </Group>
      </svg>
    </div>
  );
};
