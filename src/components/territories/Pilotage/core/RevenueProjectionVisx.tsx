import React from 'react';
import { area, curveBasis } from 'd3-shape';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';

// --- TYPES ---
export interface ProjectionPoint {
  date: Date;
  actual?: number;
  projected?: number;
  upperBound?: number;
  lowerBound?: number;
}

export interface RevenueProjectionVisxProps {
  width: number;
  height: number;
  data: ProjectionPoint[];
}

export function RevenueProjectionVisx({
  width,
  height,
  data,
}: RevenueProjectionVisxProps) {
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // SCALES
  const xScale = scaleTime({
    range: [0, innerWidth],
    domain: [
      Math.min(...data.map((d) => d.date.getTime())),
      Math.max(...data.map((d) => d.date.getTime())),
    ],
  });

  const yScale = scaleLinear({
    range: [innerHeight, 0],
    domain: [
      0,
      Math.max(...data.map((d) => d.upperBound || d.actual || 0)) * 1.1,
    ],
    nice: true,
  });

  // AREA GENERATOR (Fuzzy Cloud)
  const renderArea = (
    points: ProjectionPoint[],
    y0Accessor: (d: ProjectionPoint) => number,
    y1Accessor: (d: ProjectionPoint) => number,
    fill: string,
    opacity: number,
    blur: number
  ) => {
    const areaGen = area<ProjectionPoint>()
      .x((d) => xScale(d.date))
      .y0((d) => yScale(y0Accessor(d)))
      .y1((d) => yScale(y1Accessor(d)))
      .curve(curveBasis);

    return (
      <path
        d={areaGen(points) || undefined}
        fill={fill}
        opacity={opacity}
        filter={blur > 0 ? `blur(${blur}px)` : undefined}
      />
    );
  };

  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00D9FF" stopOpacity="0" />
          <stop offset="50%" stopColor="#00D9FF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
        </linearGradient>

        <filter id="fuzzyGlow">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <Group left={margin.left} top={margin.top}>
        {/* FOND GRAPHIQUE */}
        <rect width={innerWidth} height={innerHeight} fill="#070B18" opacity={0.5} />

        {/* 🌫️ LA NAPPE D'INCERTITUDE (3 Couches de flou) */}
        {renderArea(data, d => d.lowerBound || 0, d => d.upperBound || 0, "url(#cloudGradient)", 0.3, 20)}
        {renderArea(data, d => (d.lowerBound || 0) * 1.1, d => (d.upperBound || 0) * 0.9, "#00D9FF", 0.1, 40)}
        
        {/* 🕯️ L'ACTUALITÉ (La ligne de vérité, plus nette) */}
        {renderArea(
            data.filter(d => d.actual !== undefined), 
            d => (d.actual || 0) - 2000, 
            d => (d.actual || 0) + 2000, 
            "#B3F1FF", 
            0.4, 
            4
        )}

        {/* 🌫️ LA TENDANCE (Floue, vaporeuse) */}
        {renderArea(
            data.filter(d => d.projected !== undefined),
            d => (d.projected || 0) - 5000,
            d => (d.projected || 0) + 5000,
            "#00D9FF",
            0.2,
            12
        )}

        {/* LIGNE D'AUJOURD'HUI */}
        <line
          x1={xScale(new Date())}
          x2={xScale(new Date())}
          y1={0}
          y2={innerHeight}
          stroke="white"
          strokeOpacity={0.2}
          strokeDasharray="4 4"
        />
        <text
          x={xScale(new Date()) + 10}
          y={20}
          fill="white"
          fontSize={10}
          fontFamily="monospace"
          opacity={0.3}
        >
          AUJOURD'HUI
        </text>
      </Group>

      {/* GRAIN (COHÉRENCE DA) */}
      <filter id="projectionGrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.04" />
        </feComponentTransfer>
      </filter>
      <rect width={width} height={height} filter="url(#projectionGrain)" opacity="0.3" pointerEvents="none" />
    </svg>
  );
}
