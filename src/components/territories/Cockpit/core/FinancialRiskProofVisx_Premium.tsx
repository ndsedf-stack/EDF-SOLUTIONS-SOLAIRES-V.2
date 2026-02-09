import React, { useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { AreaClosed, LinePath, Bar, Circle } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { GridRows } from '@visx/grid';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { localPoint } from '@visx/event';
import { motion, AnimatePresence } from 'framer-motion';

export interface FinancialPoint {
  date: string;
  securedCA: number;
  exposedCA: number;
}

interface Props {
  data: FinancialPoint[];
  width?: number;
  height?: number;
}

// 🎨 TESLA-GRADE COLOR SYSTEM
const theme = {
  gradients: {
    exposed: {
      from: '#ff0844',
      to: 'rgba(255, 8, 68, 0)',
    },
    secured: {
      from: '#00d9ff',
      to: 'rgba(16, 185, 129, 0)',
    },
  },
  glow: {
    exposed: '0 0 40px rgba(255, 8, 68, 0.6), 0 0 80px rgba(255, 8, 68, 0.3)',
    secured: '0 0 40px rgba(0, 217, 255, 0.6), 0 0 80px rgba(0, 217, 255, 0.3)',
  },
  spacing: {
    top: 30,
    right: 50,
    bottom: 80,
    left: 100,
  }
};

// 💎 ANIMATED TOOLTIP
function AnimatedTooltip({ data, x, y }: { data: FinancialPoint; x: number; y: number }) {
  const formatEuro = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
    if (value >= 1000) return `${Math.round(value / 1000)}k€`;
    return `${Math.round(value)}€`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();
  };

  const total = data.securedCA + data.exposedCA;
  const exposurePercent = total > 0 ? ((data.exposedCA / total) * 100).toFixed(1) : '0.0';

  return ReactDOM.createPortal(
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: x,
        top: y - 20,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {/* GLASSMORPHISM CARD - OPACITÉ MAXIMALE */}
      <div
        className="relative backdrop-blur-2xl bg-slate-900 rounded-2xl border border-white/30 overflow-hidden"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 100px rgba(0, 217, 255, 0.3)',
        }}
      >
        {/* NEON BORDER TOP */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        
        <div className="p-5 space-y-4 min-w-[280px]">
          {/* DATE HEADER */}
          <div className="flex items-center gap-2 pb-3 border-b border-white/10">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ boxShadow: theme.glow.secured }} />
            <span className="text-[11px] font-black text-blue-300 uppercase tracking-[0.15em]">
              {formatDate(data.date)}
            </span>
          </div>

          {/* CA TOTAL - HERO */}
          <div className="bg-gradient-to-br from-white/10 to-transparent p-4 rounded-xl border border-white/20">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-white/60 uppercase tracking-wider font-bold">CA Total</span>
              <span className="text-3xl font-black text-white" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                {formatEuro(total)}
              </span>
            </div>
          </div>

          {/* BREAKDOWN */}
          <div className="grid grid-cols-2 gap-3">
            {/* SÉCURISÉ */}
            <div
              className="relative overflow-hidden bg-gradient-to-br from-cyan-500/30 to-emerald-500/20 p-3 rounded-xl border border-cyan-400/40"
              style={{ boxShadow: '0 0 20px rgba(0, 217, 255, 0.3)' }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: theme.glow.secured }} />
                  <span className="text-[9px] text-cyan-300 font-black uppercase tracking-wider">Sécurisé</span>
                </div>
                <span className="text-lg font-black text-cyan-100">
                  {formatEuro(data.securedCA)}
                </span>
              </div>
            </div>

            {/* À RISQUE */}
            <div
              className="relative overflow-hidden bg-gradient-to-br from-red-500/30 to-pink-500/20 p-3 rounded-xl border border-red-400/40"
              style={{ boxShadow: '0 0 20px rgba(255, 8, 68, 0.3)' }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-400/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" style={{ boxShadow: theme.glow.exposed }} />
                  <span className="text-[9px] text-red-300 font-black uppercase tracking-wider">À Risque</span>
                </div>
                <span className="text-lg font-black text-red-100">
                  {formatEuro(data.exposedCA)}
                </span>
              </div>
            </div>
          </div>

          {/* EXPOSITION BAR */}
          <div className="pt-3 border-t border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] text-white/50 uppercase tracking-wider font-bold">Exposition</span>
              <span className="text-sm text-white/80 font-black">{exposurePercent}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${exposurePercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                style={{ boxShadow: '0 0 10px rgba(255, 8, 68, 0.5)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* TOOLTIP POINTER */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-2">
        <div className="w-4 h-4 bg-slate-900 border-l border-b border-white/30 rotate-45" />
      </div>
    </motion.div>,
    document.body
  );
}

// 📊 MAIN COMPONENT
export function FinancialRiskProofVisx({ 
  data, 
  width = 1200, 
  height = 550 
}: Props) {
  const [hoveredPoint, setHoveredPoint] = useState<{ data: FinancialPoint; x: number; y: number } | null>(null);

  const innerWidth = width - theme.spacing.left - theme.spacing.right;
  const innerHeight = height - theme.spacing.top - theme.spacing.bottom;

  // 🛡️ GUARD: EMPÊCHER LES VALEURS NÉGATIVES SUR <RECT>


// MOVED HELPERS OUTSIDE TO CLEAN UP


  // SCALES
  const dateScale = useMemo(() => {
    if (data.length === 0) return scaleTime({ domain: [0, 1], range: [0, innerWidth] });
    return scaleTime<number>({
      domain: [new Date(data[0].date), new Date(data[data.length - 1].date)],
      range: [0, innerWidth],
    });
  }, [data, innerWidth]);

  const maxCA = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map(d => d.securedCA + d.exposedCA));
  }, [data]);

  const yScale = useMemo(() => {
    return scaleLinear<number>({
      domain: [0, maxCA * 1.1],
      range: [innerHeight, 0],
      nice: true,
    });
  }, [maxCA, innerHeight]);

  // ACCESSORS
  const getDate = (d: FinancialPoint) => new Date(d.date);
  const getX = (d: FinancialPoint) => dateScale(getDate(d));
  const getYSecured = (d: FinancialPoint) => yScale(d.securedCA);
  const getYTotal = (d: FinancialPoint) => yScale(d.securedCA + d.exposedCA);

  // INTERACTIONS
  const handleMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
    const point = localPoint(event);
    if (!point) return;

    const x = point.x - theme.spacing.left;
    const dateValue = dateScale.invert(x);
    
    const bisect = data.reduce((closest, d, i) => {
      const dDate = getDate(d).getTime();
      const closestDate = getDate(data[closest]).getTime();
      const targetDate = dateValue.getTime();
      return Math.abs(dDate - targetDate) < Math.abs(closestDate - targetDate) ? i : closest;
    }, 0);

    const d = data[bisect];
    setHoveredPoint({
      data: d,
      x: getX(d) + theme.spacing.left,
      y: getYTotal(d) + theme.spacing.top,
    });
  };

  // SMART TICKS
  const axisTicks = useMemo(() => {
    if (data.length === 0) return [];
    const step = Math.max(1, Math.ceil(data.length / 7));
    return data.filter((_, i) => i % step === 0 || i === data.length - 1).map(d => getDate(d));
  }, [data]);

  if (data.length === 0) return null;
  if (width < 10 || height < 10 || innerWidth <= 0 || innerHeight <= 0) return null;

  return (
    <div className="relative w-full overflow-visible">
      <svg width={width} height={height}>
        {/* GRADIENTS */}
        <defs>
          <LinearGradient
            id="gradient-exposed-tesla"
            from={theme.gradients.exposed.from}
            to={theme.gradients.exposed.to}
            vertical
          />
          
          <LinearGradient
            id="gradient-secured-tesla"
            from={theme.gradients.secured.from}
            to={theme.gradients.secured.to}
            vertical
          />

          {/* GLOW FILTERS */}
          <filter id="glow-intense">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${theme.spacing.left}, ${theme.spacing.top})`}>
          {/* GRID */}
          <GridRows
            scale={yScale}
            width={innerWidth}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth={1}
            numTicks={6}
          />

          {/* AREA SÉCURISÉE (Base) */}
          <AreaClosed
            data={data}
            x={getX as any}
            y={getYSecured as any}
            yScale={yScale}
            fill="url(#gradient-secured-tesla)"
            curve={curveMonotoneX}
            style={{ filter: 'url(#glow-intense)' }}
          />

          {/* AREA EXPOSÉE (Stacked) */}
          <AreaClosed
            data={data}
            x={getX as any}
            y0={getYSecured as any}
            y1={getYTotal as any}
            yScale={yScale}
            fill="url(#gradient-exposed-tesla)"
            curve={curveMonotoneX}
            style={{ filter: 'url(#glow-intense)' }}
          />

          {/* LIGNE CA SÉCURISÉ */}
          <LinePath
            data={data}
            x={getX as any}
            y={getYSecured as any}
            stroke="#00d9ff"
            strokeWidth={3}
            curve={curveMonotoneX}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 6px #00d9ff)' }}
          />

          {/* LIGNE CA TOTAL */}
          <LinePath
            data={data}
            x={getX as any}
            y={getYTotal as any}
            stroke="#ff0844"
            strokeWidth={3}
            curve={curveMonotoneX}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 6px #ff0844)' }}
          />

          {/* POINTS INTERACTIFS */}
          {data.map((d, i) => (
            <g key={i}>
              <Circle
                cx={getX(d)}
                cy={getYTotal(d)}
                r={hoveredPoint?.data === d ? 6 : 3}
                fill="#ff0844"
                stroke="white"
                strokeWidth={hoveredPoint?.data === d ? 2 : 1}
                style={{
                  filter: hoveredPoint?.data === d ? 'drop-shadow(0 0 8px #ff0844)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              />
              
              <Circle
                cx={getX(d)}
                cy={getYSecured(d)}
                r={hoveredPoint?.data === d ? 6 : 3}
                fill="#00d9ff"
                stroke="white"
                strokeWidth={hoveredPoint?.data === d ? 2 : 1}
                style={{
                  filter: hoveredPoint?.data === d ? 'drop-shadow(0 0 8px #00d9ff)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              />
            </g>
          ))}

          {/* CROSSHAIR */}
          {hoveredPoint && (
            <line
              x1={getX(hoveredPoint.data)}
              x2={getX(hoveredPoint.data)}
              y1={0}
              y2={innerHeight}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth={2}
              strokeDasharray="6,6"
              pointerEvents="none"
            />
          )}

          {/* AXES */}
          <AxisBottom
            top={innerHeight}
            scale={dateScale}
            stroke="rgba(255, 255, 255, 0.2)"
            tickStroke="rgba(255, 255, 255, 0.2)"
            tickValues={axisTicks}
            tickLabelProps={() => ({
              fill: 'rgba(255, 255, 255, 0.6)',
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              textAnchor: 'middle',
              fontWeight: 700,
              dy: 10,
            })}
            tickFormat={(d) => (d as Date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).replace('.', '')}
          />

          <AxisLeft
            scale={yScale}
            stroke="rgba(255, 255, 255, 0.2)"
            tickStroke="rgba(255, 255, 255, 0.2)"
            numTicks={6}
            tickLabelProps={() => ({
              fill: 'rgba(255, 255, 255, 0.6)',
              fontSize: 13,
              fontFamily: 'ui-monospace, monospace',
              textAnchor: 'end',
              fontWeight: 700,
              dx: -12,
            })}
            tickFormat={(v) => {
              const value = v as number;
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
              if (value >= 1000) return `${Math.round(value / 1000)}k€`;
              return `${Math.round(value)}€`;
            }}
          />

          {/* INTERACTIVE ZONE */}
          <Bar
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
            style={{ cursor: 'crosshair' }}
          />
        </g>
      </svg>

      {/* ANIMATED TOOLTIP */}
      <AnimatePresence>
        {hoveredPoint && (
          <AnimatedTooltip
            data={hoveredPoint.data}
            x={hoveredPoint.x}
            y={hoveredPoint.y}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
