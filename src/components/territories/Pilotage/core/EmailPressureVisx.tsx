import React from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { ParentSize } from '@visx/responsive';
import { AxisBottom } from '@visx/axis';

/**
 * EMAIL PRESSURE VISX
 * Replaces legacy DashboardTrafficChart with a modern, 
 * brutalist representation of email traffic.
 */

interface TrafficData {
  date: string;
  count: number; // Represents SENT
  opened?: number;
  clicked?: number;
}

interface EmailPressureVisxProps {
  data: TrafficData[];
}

import { BarStack } from '@visx/shape';
import { LegendOrdinal } from '@visx/legend';
import { scaleOrdinal } from '@visx/scale';

const KEYS = ['clicked', 'opened', 'sentNeg']; // Stack order: Click (bottom), Open, Sent (top remnant)
const COLORS_MAP = {
  clicked: '#4ADE80', // Green (Success)
  opened: '#818CF8',  // Indigo (Interest)
  sentNeg: '#312E81'  // Dark Indigo (Noise/Sent only)
};

const EmailPressureContent: React.FC<EmailPressureVisxProps & { width: number; height: number }> = ({ 
  data, 
  width, 
  height 
}) => {
  const margin = { top: 10, bottom: 25, left: 10, right: 10 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // 1. TRANSFORM DATA : Use Real Breakdown
  const stackedData = data.map(d => {
      const sent = d.count;
      // Use real data if available, else 0 (don't mock anymore)
      const opened = d.opened || 0; 
      const clicked = d.clicked || 0;
      
      // Broken Stack Logic:
      // Clicked is bottom layer
      // Opened is middle layer (we subtract clicked to avoid double counting height)
      // Sent is top layer (we subtract opened to show "unread/unacted" rest)
      const openedSegment = Math.max(0, opened - clicked);
      const sentSegment = Math.max(0, sent - opened); // Assuming open implies sent
      
      return {
          date: d.date,
          clicked,
          opened: openedSegment,
          sentNeg: sentSegment,
          originalTotal: sent
      };
  });

  const xScale = scaleBand<string>({
    range: [0, xMax],
    round: true,
    domain: stackedData.map((d) => d.date),
    padding: 0.4,
  });

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    round: true,
    domain: [0, Math.max(...data.map((d) => d.count)) || 10],
  });

  const colorScale = scaleOrdinal({
    domain: KEYS,
    range: [COLORS_MAP.clicked, COLORS_MAP.opened, COLORS_MAP.sentNeg],
  });

  return (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        
        {/* LÉGENDE IN-CHART (Top Right) */}
        <Group left={xMax - 180} top={-5}>
             <rect x={0} y={0} width={8} height={8} fill={COLORS_MAP.sentNeg} rx={2} />
             <text x={12} y={8} fill="#ffffff" opacity={0.6} fontSize={9} fontFamily="sans-serif">ENVOYÉ</text>
             
             <rect x={60} y={0} width={8} height={8} fill={COLORS_MAP.opened} rx={2} />
             <text x={72} y={8} fill="#ffffff" opacity={0.6} fontSize={9} fontFamily="sans-serif">OUVERT</text>

             <rect x={120} y={0} width={8} height={8} fill={COLORS_MAP.clicked} rx={2} />
             <text x={132} y={8} fill="#ffffff" opacity={0.6} fontSize={9} fontFamily="sans-serif">CLIQUÉ</text>
        </Group>

        <BarStack
            data={stackedData}
            keys={KEYS}
            x={d => d.date}
            xScale={xScale}
            yScale={yScale}
            color={colorScale}
        >
            {barStacks =>
                barStacks.map(stack =>
                    stack.bars.map(bar => (
                        <rect
                            key={`bar-stack-${stack.key}-${bar.index}`}
                            x={bar.x}
                            y={bar.y}
                            width={bar.width}
                            height={bar.height}
                            fill={bar.color}
                            rx={2} // Rounded stacks
                            opacity={0.9}
                        />
                    ))
                )
            }
        </BarStack>

        <AxisBottom
            top={yMax}
            scale={xScale}
            stroke="rgba(255,255,255,0.1)"
            tickStroke="rgba(255,255,255,0.1)"
            tickLabelProps={() => ({
              fill: '#ffffff',
              fontSize: 12, // High Contrast Fix (Option A kept)
              opacity: 0.8,
              textAnchor: 'middle',
              fontFamily: 'sans-serif',
              fontWeight: 600,
            })}
            tickFormat={(dateString) => {
               const date = new Date(dateString as string);
               return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
            }}
          />
      </Group>
    </svg>
  );
};

export const EmailPressureVisx: React.FC<EmailPressureVisxProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-48 bg-white/5 rounded-xl p-6 border border-white/5 flex flex-col justify-between shadow-2xl shadow-indigo-500/5">
      <div className="flex justify-between items-end mb-2">
         <div>
            <div className="text-[11px] uppercase tracking-widest text-white/50 font-black mb-1">
                Pression d'envoi (14 jours)
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                   <span className="text-[10px] text-indigo-200 font-bold uppercase">Activité Totale</span>
                </div>
            </div>
         </div>
      </div>
      <div className="w-full h-32 relative">
        <ParentSize>
          {({ width, height }) => <EmailPressureContent data={data} width={width} height={height} />}
        </ParentSize>
      </div>
    </div>
  );
};
