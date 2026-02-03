import React, { useMemo, useCallback } from 'react';
import { Group } from '@visx/group';
import { AreaClosed, LinePath, Bar } from '@visx/shape';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { ParentSize } from '@visx/responsive';
import { max, bisector, extent } from 'd3-array';
import { timeFormat } from 'd3-time-format';

export type FinancialPoint = {
  date: string;
  securedCA: number;
  exposedCA: number;
};

interface Props {
  data: FinancialPoint[];
  width: number;
  height: number;
}

const COLORS = {
  securedStart: '#10B981', // Emerald 500
  securedEnd: '#064E3B',   // Emerald 900
  securedStroke: '#34D399',// Emerald 400
  exposedStart: '#EF4444', // Red 500
  exposedEnd: '#7F1D1D',   // Red 900
  exposedStroke: '#F87171',// Red 400
  axis: '#9CA3AF',         // Gray 400
  grid: '#FFFFFF10',
  tooltipBg: '#0F172A',
};

const formatDate = timeFormat("%d %b");
const getDate = (d: FinancialPoint) => new Date(d.date);
const getSecured = (d: FinancialPoint) => d.securedCA;
const getExposed = (d: FinancialPoint) => d.exposedCA;
const getStackTotal = (d: FinancialPoint) => d.securedCA + d.exposedCA;

const bisectDate = bisector<FinancialPoint, Date>((d) => new Date(d.date)).left;

const FinancialRiskProofInner = ({ data, width, height }: Props) => {
  const margin = { top: 40, right: 30, bottom: 50, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipTop = 0,
    tooltipLeft = 0,
  } = useTooltip<FinancialPoint>();

  // SCALES
  const xScale = useMemo(() => scaleTime({
    domain: extent(data, getDate) as [Date, Date],
    range: [0, innerWidth],
  }), [data, innerWidth]);

  const yScale = useMemo(() => scaleLinear({
    domain: [0, (max(data, getStackTotal) || 1000) * 1.1], // +10% padding top
    range: [innerHeight, 0],
    nice: true,
  }), [data, innerHeight]);

  // HANDLERS
  const handleTooltip = useCallback((event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
    const { x } = localPoint(event) || { x: 0 };
    const x0 = xScale.invert(x - margin.left);
    const index = bisectDate(data, x0, 1);
    const d0 = data[index - 1];
    const d1 = data[index];
    let d = d0;
    if (d1 && getDate(d1)) {
      d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
    }
    
    if (d) {
        showTooltip({
            tooltipData: d,
            tooltipLeft: xScale(getDate(d)) + margin.left,
            tooltipTop: yScale(getStackTotal(d)) + margin.top, // Tooltip au sommet de la stack
        });
    }
  }, [showTooltip, xScale, yScale, data, margin]);

  if (width < 10) return null;

  return (
    <>
        <svg width={width} height={height}>
            {/* DEFINITIONS DES GRADIENTS & FILTERS */}
            <defs>
              <LinearGradient id="gradient-secured" from={COLORS.securedStart} to={COLORS.securedEnd} fromOpacity={0.6} toOpacity={0.05} />
              <LinearGradient id="gradient-exposed" from={COLORS.exposedStart} to={COLORS.exposedEnd} fromOpacity={0.6} toOpacity={0.05} />
              
              {/* GLOW FILTER */}
              <filter id="glow-secured" x="-50%" y="-50%" width="200%" height="200%">
                 <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                 <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                 </feMerge>
              </filter>
               <filter id="glow-exposed" x="-50%" y="-50%" width="200%" height="200%">
                 <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                 <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                 </feMerge>
              </filter>
            </defs>
            
            <Group left={margin.left} top={margin.top}>
                
                {/* GRID LINES (Custom) */}
                {yScale.ticks(5).map((tickValue, i) => (
                    <line
                        key={`line-${tickValue}-${i}`}
                        x1={0}
                        x2={innerWidth}
                        y1={yScale(tickValue)}
                        y2={yScale(tickValue)}
                        stroke={COLORS.grid}
                        strokeDasharray="4 4"
                    />
                ))}

                {/* 1. LAYER SECURED (Fondation) */}
                <AreaClosed<FinancialPoint>
                    data={data}
                    x={d => xScale(getDate(d))}
                    y={d => yScale(getSecured(d))}
                    yScale={yScale}
                    stroke="transparent"
                    fill="url(#gradient-secured)"
                    curve={curveMonotoneX}
                />
                <LinePath<FinancialPoint>
                    data={data}
                    x={d => xScale(getDate(d))}
                    y={d => yScale(getSecured(d))}
                    stroke={COLORS.securedStroke}
                    strokeWidth={3}
                    curve={curveMonotoneX}
                    filter="url(#glow-secured)" // ✨ GLOW ADDED
                />

                {/* 2. LAYER EXPOSED */}
                <AreaClosed<FinancialPoint>
                    data={data}
                    x={d => xScale(getDate(d))}
                    y0={d => yScale(getSecured(d))} // Part du haut de secured
                    y1={d => yScale(getSecured(d) + getExposed(d))} // Va jusqu'au total
                    yScale={yScale}
                    stroke="transparent"
                    fill="url(#gradient-exposed)"
                    curve={curveMonotoneX}
                />
                {/* Ligne du top total */}
                <LinePath<FinancialPoint>
                    data={data}
                    x={d => xScale(getDate(d))}
                    y={d => yScale(getSecured(d) + getExposed(d))}
                    stroke={COLORS.exposedStroke}
                    strokeWidth={3}
                    curve={curveMonotoneX}
                    filter="url(#glow-exposed)" // ✨ GLOW ADDED
                />

                {/* AXES */}
                <AxisBottom
                    top={innerHeight}
                    scale={xScale}
                    stroke="transparent"
                    tickStroke="transparent"
                    numTicks={width > 500 ? 10 : 5}
                    tickLabelProps={() => ({
                        fill: COLORS.axis,
                        fontSize: 10,
                        textAnchor: 'middle',
                        fontFamily: 'sans-serif',
                        fontWeight: 600
                    })}
                    tickFormat={(val) => formatDate(val as Date)}
                />
                <AxisLeft
                    scale={yScale}
                    stroke="transparent"
                    tickStroke="transparent"
                    numTicks={5}
                    tickLabelProps={() => ({
                        fill: COLORS.axis,
                        fontSize: 10,
                        textAnchor: 'end',
                        dx: -5,
                        dy: 3,
                        fontFamily: 'sans-serif',
                        fontWeight: 600
                    })}
                    tickFormat={(val) => `${(val as number / 1000).toFixed(0)}k€`}
                />

                {/* INTERACTION LAYER & CURSOR */}
                <Bar
                    x={0}
                    y={0}
                    width={innerWidth}
                    height={innerHeight}
                    fill="transparent"
                    rx={14}
                    onTouchStart={handleTooltip}
                    onTouchMove={handleTooltip}
                    onMouseMove={handleTooltip}
                    onMouseLeave={() => hideTooltip()}
                />

                {/* TOOLTIP LINE INDICATOR */}
                {tooltipData && (
                    <line
                        x1={tooltipLeft - margin.left}
                        x2={tooltipLeft - margin.left}
                        y1={0}
                        y2={innerHeight}
                        stroke="white"
                        strokeOpacity={0.2}
                        strokeWidth={1}
                        pointerEvents="none"
                    />
                )}
            </Group>
        </svg>

        {/* TOOLTIP HTML */}
        {tooltipData && (
            <TooltipWithBounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft}
                style={{
                    ...defaultStyles,
                    backgroundColor: COLORS.tooltipBg,
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                }}
            >
                <div className="flex flex-col gap-1 min-w-[140px]">
                    <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        {formatDate(getDate(tooltipData))}
                    </div>
                    
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-xs text-red-300 font-medium">À Risque</span>
                        <span className="text-sm font-black text-red-400">
                            {getExposed(tooltipData).toLocaleString()} €
                        </span>
                    </div>

                    <div className="flex justify-between items-center gap-4">
                         <span className="text-xs text-emerald-300 font-medium">Sécurisé</span>
                         <span className="text-sm font-black text-emerald-400">
                            {getSecured(tooltipData).toLocaleString()} €
                        </span>
                    </div>

                    <div className="h-[1px] bg-white/10 my-1" />
                    
                    <div className="flex justify-between items-center gap-4">
                        <span className="text-xs text-white font-bold">TOTAL</span>
                        <span className="text-sm font-black text-white">
                           {getStackTotal(tooltipData).toLocaleString()} €
                       </span>
                   </div>
                </div>
            </TooltipWithBounds>
        )}
    </>
  );
};

export const FinancialRiskProofVisx = ({ data }: { data: FinancialPoint[] }) => {
    return (
        <div className="w-full h-[350px] relative font-sans">
            <ParentSize>
                {({ width, height }) => <FinancialRiskProofInner data={data} width={width} height={height} />}
            </ParentSize>
        </div>
    );
};
