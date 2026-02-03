import React from 'react';
import { Group } from '@visx/group';
import { AreaClosed, LinePath } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';

/**
 * 🌊 LeadsFlowVisx
 * Répond à : "Le moteur détecte-t-il les bonnes opportunités ?"
 * Séries : Qualifiés (Vert), À relancer (Orange), Perdus (Gris)
 */

export interface LeadFlowPoint {
  day: number;
  qualified: number;
  toFollow: number;
  lost: number;
}

interface Props {
  data: LeadFlowPoint[];
  width: number;
  height: number;
}

const COLORS = {
  qualified: '#4ADE80',
  toFollow: '#FB923C',
  lost: '#475569',
  bg: '#0A0E27'
};

export const LeadsFlowVisx: React.FC<Props> = ({ data, width, height }) => {
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = scaleLinear({
    domain: [0, 30],
    range: [0, innerWidth],
  });

  const maxVal = Math.max(...data.map(d => Math.max(d.qualified, d.toFollow, d.lost)), 10);
  const yScale = scaleLinear({
    domain: [0, maxVal],
    range: [innerHeight, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height} className="bg-transparent">
      <Group left={margin.left} top={margin.top}>
        
        {/* AXES */}
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="#ffffff10"
          tickStroke="#ffffff10"
          tickLabelProps={() => ({
            fill: '#ffffff20',
            fontSize: 9,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'middle',
          })}
          tickValues={[0, 7, 14, 21, 30]}
        />
        <AxisLeft
          scale={yScale}
          stroke="#ffffff10"
          tickStroke="#ffffff10"
          tickLabelProps={() => ({
            fill: '#ffffff20',
            fontSize: 9,
            fontFamily: 'IBM Plex Mono',
            textAnchor: 'end',
            verticalAnchor: 'middle',
          })}
        />

        {/* PERDUS (Gris - Fond) */}
        <AreaClosed
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.lost)}
          yScale={yScale}
          fill={COLORS.lost}
          fillOpacity={0.05}
          curve={curveMonotoneX}
        />
        <LinePath
            data={data}
            x={d => xScale(d.day)}
            y={d => yScale(d.lost)}
            stroke={COLORS.lost}
            strokeWidth={1}
            strokeDasharray="4 4"
            curve={curveMonotoneX}
        />

        {/* À RELANCER (Orange) */}
        <LinePath
            data={data}
            x={d => xScale(d.day)}
            y={d => yScale(d.toFollow)}
            stroke={COLORS.toFollow}
            strokeWidth={2}
            curve={curveMonotoneX}
        />

        {/* QUALIFIÉS (Vert - Premier plan) */}
        <AreaClosed
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.qualified)}
          yScale={yScale}
          fill={COLORS.qualified}
          fillOpacity={0.1}
          curve={curveMonotoneX}
        />
        <LinePath
          data={data}
          x={d => xScale(d.day)}
          y={d => yScale(d.qualified)}
          stroke={COLORS.qualified}
          strokeWidth={2}
          curve={curveMonotoneX}
        />
      </Group>
    </svg>
  );
};
