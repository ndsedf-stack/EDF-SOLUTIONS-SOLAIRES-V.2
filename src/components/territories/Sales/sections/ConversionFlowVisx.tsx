import React, { useMemo, useState } from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { ParentSize } from '@visx/responsive';

export type ConversionStep = {
  label: string;
  value: number;
  revenue: number;
  avgDelay?: number;
  isFriction?: boolean;
  color: string;
};

interface Props {
  data: ConversionStep[];
  width: number;
  height: number;
  benchmarkPercentage?: number;
}

const ConversionFlowInner = ({ data, width, height, benchmarkPercentage = 42 }: Props) => {
  const [hovered, setHovered] = useState<number | null>(null);
  
  const margin = { top: 60, right: 30, bottom: 80, left: 30 };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const xScale = useMemo(() => scaleBand({
    domain: data.map(d => d.label),
    range: [0, innerWidth],
    padding: 0.25,
  }), [data, innerWidth]);

  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  const yScale = useMemo(() => scaleLinear({
    domain: [0, maxValue],
    range: [innerHeight, 10], 
  }), [maxValue, innerHeight]);

  return (
    <div className="relative group/funnel">
      <svg width={width} height={height} className="overflow-visible">
        <Group left={margin.left} top={margin.top}>
          {/* BENCHMARK LINE (GLOBAL TARGET) */}
          {benchmarkPercentage && (
              <Group top={innerHeight * (1 - benchmarkPercentage/100)}>
                  <line x1={0} x2={innerWidth} stroke="#4ECDC4" strokeWidth={1} strokeDasharray="4,4" opacity={0.15} />
                  <text x={innerWidth} y={-5} fill="#4ECDC4" fontSize={9} fontWeight="black" textAnchor="end" className="uppercase tracking-widest opacity-40">
                      Target {benchmarkPercentage}%
                  </text>
              </Group>
          )}

          {data.map((d, i) => {
            const barWidth = xScale.bandwidth();
            const barX = xScale(d.label) || 0;
            const barHeight = Math.max(50, innerHeight - yScale(d.value)); // Increased minimum for revenue text
            const barY = innerHeight - barHeight;
            
            const isWorst = d.isFriction;
            const prevValue = i > 0 ? data[i-1].value : null;
            const conversionRate = prevValue ? Math.round((d.value / prevValue) * 100) : null;

            return (
              <Group 
                  key={`step-${i}`} 
                  onMouseEnter={() => setHovered(i)} 
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
              >
                {/* TRANSITION INDICATOR */}
                {conversionRate !== null && (
                   <Group left={barX - (xScale.step() * xScale.padding() / 2)}>
                      <text y={innerHeight - 20} textAnchor="middle" fill={isWorst ? "#FF6B6B" : "white"} opacity={isWorst ? 1 : 0.6} fontSize={14} fontWeight="900" fontFamily="IBM Plex Mono">
                          {conversionRate}%
                      </text>
                      <path d="M -5 10 L 0 15 L 5 10" fill="none" stroke={isWorst ? "#FF6B6B" : "white"} strokeWidth={2} opacity={isWorst ? 1 : 0.3} transform={`translate(0, ${innerHeight - 45})`} />
                   </Group>
                )}

                {/* MAIN RECT */}
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={isWorst ? "url(#frictionGradient)" : d.color}
                  fillOpacity={hovered === i ? 0.9 : 0.7}
                  stroke={isWorst ? "#FF6B6B" : "white"}
                  strokeOpacity={hovered === i ? 1 : 0.4}
                  strokeWidth={isWorst ? 3 : 1}
                  rx={6}
                  className="transition-all duration-300"
                />

                {/* COUNT ABOVE BAR (Subtle) */}
                <text 
                  x={barX + barWidth / 2} 
                  y={barY - 8} 
                  fill="white" 
                  fontSize={11} 
                  fontWeight="bold" 
                  fontFamily="IBM Plex Mono" 
                  textAnchor="middle" 
                  opacity={0.4}
                >
                  {d.value}
                </text>
                
                {/* REVENUE INSIDE BAR (Prominent) */}
                <text 
                  x={barX + barWidth / 2} 
                  y={barY + barHeight / 2 + 6} 
                  fill="white" 
                  opacity={0.95} 
                  fontSize={barHeight > 80 ? 18 : 16} 
                  fontWeight="black" 
                  fontFamily="IBM Plex Mono" 
                  textAnchor="middle"
                  style={{ filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.95))' }}
                >
                  {Math.round(d.revenue / 1000)}k€
                </text>

                {/* PERMANENT DELAY BADGE */}
                {d.avgDelay !== undefined && d.avgDelay > 0 && (
                  <Group top={innerHeight + 16} left={barX + barWidth/2}>
                      <text fill={d.avgDelay > 7 ? "#FF6B6B" : "white"} opacity={0.6} fontSize={11} fontWeight="black" textAnchor="middle">
                          {d.avgDelay}j
                      </text>
                  </Group>
                )}

                {/* LABEL (BIGGER) */}
                <text x={barX + barWidth / 2} y={innerHeight + 48} fill="white" opacity={hovered === i ? 1 : 0.3} fontSize={12} fontWeight="900" className="uppercase tracking-[0.2em]" textAnchor="middle">
                  {d.label}
                </text>
              </Group>
            );
          })}

          <defs>
            <linearGradient id="frictionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#E63946" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </Group>
      </svg>

      {/* HOVER TOOLTIP POPUP */}
      {hovered !== null && (
        <div 
            className="absolute z-50 pointer-events-none bg-[#1a1c23] border border-white/20 p-4 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-200"
            style={{ 
                left: xScale(data[hovered].label)! + margin.left + xScale.bandwidth()/2,
                top: margin.top + (innerHeight - Math.max(25, innerHeight - yScale(data[hovered].value))) - 100,
                transform: 'translateX(-50%)'
            }}
        >
            <div className="flex flex-col gap-1 min-w-[140px]">
                <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">{data[hovered].label}</div>
                <div className="flex justify-between items-baseline gap-4 mt-2">
                    <span className="text-2xl font-black text-white font-mono">{data[hovered].value}</span>
                    <span className="text-xs font-bold text-white/40 uppercase">Dossiers</span>
                </div>
                <div className="text-lg font-black text-emerald-400 font-mono">
                    {Math.round(data[hovered].revenue/1000)}k€ <span className="text-[10px] text-white/20 uppercase tracking-tighter">Volume</span>
                </div>
                {hovered > 0 && (
                   <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center">
                      <span className="text-[9px] font-bold text-white/30 uppercase">Efficience</span>
                      <span className="text-sm font-black text-white">{Math.round((data[hovered].value / data[hovered-1].value) * 100)}%</span>
                   </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export function ConversionFlowVisx({ data, benchmarkPercentage }: { data: ConversionStep[], benchmarkPercentage?: number }) {
  if (!data || data.length === 0) return null;
  return (
    <div style={{ width: '100%', height: '320px' }} className="relative">
      <ParentSize>
        {({ width, height }) => (
            <ConversionFlowInner data={data} width={width} height={height} benchmarkPercentage={benchmarkPercentage} />
        )}
      </ParentSize>
    </div>
  );
}
