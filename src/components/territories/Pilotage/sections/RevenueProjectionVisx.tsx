import React, { useMemo, useState } from 'react';
import { Group } from '@visx/group';
import { AreaClosed, LinePath, Bar } from '@visx/shape';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { ParentSize } from '@visx/responsive';
import { extent, max } from 'd3-array';
import { GridRows } from '@visx/grid';
import { LinearGradient } from '@visx/gradient';
import { localPoint } from '@visx/event';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { bisector } from 'd3-array';

export type ProjectionPoint = {
  date: Date;
  secured: number;
  projected: number;
  target: number;
};

interface Props {
  data: ProjectionPoint[];
  width: number;
  height: number;
}

const COLORS = {
  secured: '#10B981',      // Emerald
  projected: '#06B6D4',    // Cyan
  target: '#F59E0B',       // Amber
  background: '#0F1629',
  text: {
    primary: '#F9FAFB',
    secondary: '#94A3B8',
    muted: '#64748B',
  },
  border: 'rgba(255, 255, 255, 0.08)',
};

const bisectDate = bisector<ProjectionPoint, Date>((d) => d.date).left;

const RevenueProjectionInner = ({ data, width, height }: Props) => {
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<ProjectionPoint>();

  const margin = useMemo(() => ({ top: 40, right: 40, bottom: 60, left: 90 }), []);
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const xScale = useMemo(() => scaleTime({
    domain: extent(data, d => d.date) as [Date, Date],
    range: [0, innerWidth],
  }), [data, innerWidth]);

  const yScale = useMemo(() => {
    const maxValue = max(data, d => Math.max(d.projected, d.target, d.secured)) || 1000000;
    return scaleLinear({
      domain: [0, maxValue * 1.15], // +15% d'espace en haut
      nice: true,
      range: [innerHeight, 0],
    });
  }, [data, innerHeight]);

  // SVG Safety Check after hooks
  if (width < 10 || height < 10 || innerWidth <= 0 || innerHeight <= 0) return null;

  const finalPoint = data[data.length - 1];
  const gapAtEnd = finalPoint ? finalPoint.target - finalPoint.projected : 0;
  const isOnTrack = gapAtEnd <= 0;

  // Gestion du tooltip
  const handleTooltip = (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
    const { x } = localPoint(event) || { x: 0 };
    const x0 = xScale.invert(x);
    const index = bisectDate(data, x0, 1);
    const d0 = data[index - 1];
    const d1 = data[index];
    let d = d0;
    if (d1 && d1.date) {
      d = x0.valueOf() - d0.date.valueOf() > d1.date.valueOf() - x0.valueOf() ? d1 : d0;
    }
    showTooltip({
      tooltipData: d,
      tooltipLeft: xScale(d.date),
      tooltipTop: yScale((d.secured + d.projected) / 2),
    });
  };

  return (
    <div className="relative">
      <svg width={width} height={height}>
        <defs>
          {/* Gradients premium */}
          <LinearGradient 
            id="secured-gradient" 
            from={COLORS.secured} 
            to={COLORS.secured} 
            fromOpacity={0.4} 
            toOpacity={0.05} 
            vertical 
          />
          <LinearGradient 
            id="projected-gradient" 
            from={COLORS.projected} 
            to={COLORS.projected} 
            fromOpacity={0.3} 
            toOpacity={0.02} 
            vertical 
          />
          <LinearGradient 
            id="line-gradient-secured" 
            from={COLORS.secured} 
            to="#059669"
            vertical={false}
          />
          <LinearGradient 
            id="line-gradient-projected" 
            from={COLORS.projected} 
            to="#0891B2"
            vertical={false}
          />
          
          {/* Glow effects */}
          <filter id="glow-green">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="glow-cyan">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <Group left={margin.left} top={margin.top}>
          {/* Grid subtile */}
          <GridRows
            scale={yScale}
            width={innerWidth}
            strokeDasharray="2,4"
            stroke={COLORS.border}
            strokeOpacity={0.2}
            pointerEvents="none"
          />

          {/* Zone Sécurisée (Socle solide) */}
          <AreaClosed<ProjectionPoint>
            data={data}
            x={d => xScale(d.date)}
            y={d => yScale(d.secured)}
            yScale={yScale}
            fill="url(#secured-gradient)"
            curve={curveMonotoneX}
          />

          {/* Corridor Projection (Zone d'incertitude) */}
          <AreaClosed<ProjectionPoint>
            data={data}
            x={d => xScale(d.date)}
            y0={d => yScale(d.secured)}
            y1={d => yScale(d.projected)}
            yScale={yScale}
            fill="url(#projected-gradient)"
            curve={curveMonotoneX}
          />

          {/* LIGNE OBJECTIF (Benchmark - Dashée) */}
          <LinePath<ProjectionPoint>
            data={data}
            x={d => xScale(d.date)}
            y={d => yScale(d.target)}
            stroke={COLORS.target}
            strokeWidth={3}
            strokeDasharray="8,5"
            strokeOpacity={0.8}
            curve={curveMonotoneX}
            strokeLinecap="round"
          />

          {/* LIGNE SÉCURISÉE (Base verte) */}
          <LinePath<ProjectionPoint>
            data={data}
            x={d => xScale(d.date)}
            y={d => yScale(d.secured)}
            stroke="url(#line-gradient-secured)"
            strokeWidth={3}
            strokeOpacity={0.9}
            curve={curveMonotoneX}
            strokeLinecap="round"
            filter="url(#glow-green)"
          />

          {/* LIGNE PROJECTION (Prédiction cyan) */}
          <LinePath<ProjectionPoint>
            data={data}
            x={d => xScale(d.date)}
            y={d => yScale(d.projected)}
            stroke="url(#line-gradient-projected)"
            strokeWidth={4}
            strokeOpacity={1}
            curve={curveMonotoneX}
            strokeLinecap="round"
            filter="url(#glow-cyan)"
          />

          {/* Points sur la ligne de projection */}
          {data.filter((_, i) => i % 3 === 0 || i === data.length - 1).map((d, i) => (
            <circle
              key={i}
              cx={xScale(d.date)}
              cy={yScale(d.projected)}
              r={4}
              fill={COLORS.background}
              stroke={COLORS.projected}
              strokeWidth={2.5}
              style={{
                filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.7))',
              }}
            />
          ))}

          {/* Marqueur Final (Point d'atterrissage) */}
          {finalPoint && (
            <Group>
              {/* Cercle extérieur pulsant */}
              <circle
                cx={xScale(finalPoint.date)}
                cy={yScale(finalPoint.projected)}
                r={12}
                fill="none"
                stroke={isOnTrack ? COLORS.secured : '#EF4444'}
                strokeWidth={2}
                strokeOpacity={0.3}
                className="animate-ping"
              />
              {/* Cercle principal */}
              <circle
                cx={xScale(finalPoint.date)}
                cy={yScale(finalPoint.projected)}
                r={7}
                fill={isOnTrack ? COLORS.secured : '#EF4444'}
                stroke={COLORS.background}
                strokeWidth={3}
                style={{
                  filter: `drop-shadow(0 0 10px ${isOnTrack ? COLORS.secured : '#EF4444'})`,
                }}
              />
              {/* Label atterrissage */}
              <text
                x={xScale(finalPoint.date)}
                y={yScale(finalPoint.projected) - 25}
                fill={COLORS.text.primary}
                fontSize={11}
                fontWeight="800"
                textAnchor="middle"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                {new Intl.NumberFormat('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR', 
                  maximumFractionDigits: 0 
                }).format(finalPoint.projected)}
              </text>
              <text
                x={xScale(finalPoint.date)}
                y={yScale(finalPoint.projected) - 12}
                fill={COLORS.text.secondary}
                fontSize={9}
                fontWeight="600"
                textAnchor="middle"
                style={{ fontFamily: 'sans-serif' }}
              >
                PROJECTION 90J
              </text>
            </Group>
          )}

          {/* Label Target (coin supérieur droit) */}
          {finalPoint && (
            <Group>
              <rect
                x={innerWidth - 150}
                y={yScale(finalPoint.target) - 30}
                width={145}
                height={28}
                rx={6}
                fill={COLORS.background}
                fillOpacity={0.8}
                stroke={COLORS.target}
                strokeWidth={1.5}
                strokeOpacity={0.4}
              />
              <text
                x={innerWidth - 77.5}
                y={yScale(finalPoint.target) - 10}
                fill={COLORS.target}
                fontSize={10}
                fontWeight="800"
                textAnchor="middle"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                OBJECTIF Q2
              </text>
            </Group>
          )}

          {/* Axes premium */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke={COLORS.border}
            tickStroke={COLORS.border}
            numTicks={6}
            tickLabelProps={() => ({
              fill: COLORS.text.muted,
              fontSize: 10,
              fontWeight: '600',
              fontFamily: '"JetBrains Mono", monospace',
              textAnchor: 'middle',
            })}
          />
          <AxisLeft
            scale={yScale}
            stroke={COLORS.border}
            tickStroke={COLORS.border}
            numTicks={6}
            tickLabelProps={() => ({
              fill: COLORS.text.muted,
              fontSize: 10,
              fontWeight: '700',
              fontFamily: '"JetBrains Mono", monospace',
              textAnchor: 'end',
              dx: -8,
            })}
            tickFormat={d => `${Math.round((d as number) / 1000)}K€`}
          />

          {/* Tooltip trigger area */}
          <Bar
            x={0}
            y={0}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onTouchStart={handleTooltip}
            onTouchMove={handleTooltip}
            onMouseMove={handleTooltip}
            onMouseLeave={() => hideTooltip()}
          />

          {/* Ligne verticale tooltip */}
          {tooltipData && (
            <Group>
              <line
                x1={tooltipLeft}
                y1={0}
                x2={tooltipLeft}
                y2={innerHeight}
                stroke={COLORS.projected}
                strokeWidth={1.5}
                strokeDasharray="4,4"
                strokeOpacity={0.5}
                pointerEvents="none"
              />
              <circle
                cx={tooltipLeft}
                cy={yScale(tooltipData.projected)}
                r={6}
                fill={COLORS.projected}
                stroke={COLORS.background}
                strokeWidth={3}
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))',
                }}
                pointerEvents="none"
              />
            </Group>
          )}
        </Group>
      </svg>

      {/* Tooltip premium */}
      {tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop + margin.top}
          left={tooltipLeft + margin.left}
          style={{
            ...defaultStyles,
            background: 'rgba(15, 22, 41, 0.95)',
            border: `1px solid ${COLORS.border}`,
            borderRadius: '12px',
            padding: '12px 16px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            minWidth: '200px',
          }}
        >
          <div style={{ fontFamily: '"Inter", sans-serif', color: COLORS.text.primary }}>
            {/* Date */}
            <div style={{ 
              fontSize: '11px', 
              color: COLORS.text.muted, 
              marginBottom: '8px', 
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {tooltipData.date.toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
            </div>

            {/* Sécurisé */}
            <div style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '10px', color: COLORS.text.secondary, marginBottom: '2px' }}>
                Sécurisé
              </div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 900, 
                fontFamily: '"JetBrains Mono", monospace',
                color: COLORS.secured
              }}>
                {(tooltipData.secured / 1000).toFixed(0)} K€
              </div>
            </div>

            {/* Projection */}
            <div style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '10px', color: COLORS.text.secondary, marginBottom: '2px' }}>
                Projection
              </div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 900, 
                fontFamily: '"JetBrains Mono", monospace',
                color: COLORS.projected
              }}>
                {(tooltipData.projected / 1000).toFixed(0)} K€
              </div>
            </div>

            {/* Gap vs Target */}
            <div style={{ 
              marginTop: '8px', 
              paddingTop: '8px', 
              borderTop: `1px solid ${COLORS.border}` 
            }}>
              <div style={{ fontSize: '10px', color: COLORS.text.secondary, marginBottom: '2px' }}>
                Gap vs Objectif
              </div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 900, 
                fontFamily: '"JetBrains Mono", monospace',
                color: tooltipData.target > tooltipData.projected ? '#EF4444' : COLORS.secured
              }}>
                {tooltipData.target > tooltipData.projected ? '-' : '+'}
                {Math.abs((tooltipData.projected - tooltipData.target) / 1000).toFixed(0)} K€
              </div>
            </div>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
};

export function RevenueProjectionVisx({ data }: { data: ProjectionPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-white/40">
        <div className="text-center space-y-3">
          <div className="text-5xl opacity-20">📈</div>
          <p className="text-sm font-semibold">Aucune donnée de projection disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '450px' }}>
      <ParentSize>
        {({ width, height }) => <RevenueProjectionInner data={data} width={width} height={height} />}
      </ParentSize>
    </div>
  );
}