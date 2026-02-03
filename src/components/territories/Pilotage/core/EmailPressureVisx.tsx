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
  count: number;
}

interface EmailPressureVisxProps {
  data: TrafficData[];
}

const EmailPressureContent: React.FC<EmailPressureVisxProps & { width: number; height: number }> = ({ 
  data, 
  width, 
  height 
}) => {
  const margin = { top: 10, bottom: 25, left: 10, right: 10 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  const xScale = scaleBand<string>({
    range: [0, xMax],
    round: true,
    domain: data.map((d) => d.date),
    padding: 0.4,
  });

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    round: true,
    domain: [0, Math.max(...data.map((d) => d.count)) || 10],
  });

  return (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        {data.map((d) => {
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - (yScale(d.count) ?? 0);
          const barX = xScale(d.date) ?? 0;
          const barY = yMax - barHeight;

          return (
            <React.Fragment key={`bar-${d.date}`}>
               <Bar
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#pressure-gradient)"
                  rx={2}
                  onMouseOver={(e) => {
                     (e.target as SVGRectElement).style.fillOpacity = "0.8";
                  }}
                  onMouseOut={(e) => {
                     (e.target as SVGRectElement).style.fillOpacity = "1";
                  }}
               >
                   <title>{`${new Date(d.date).toLocaleDateString('fr-FR')} : ${d.count} interactions`}</title>
               </Bar>
            </React.Fragment>
          );
        })}
        <AxisBottom
            top={yMax}
            scale={xScale}
            stroke="rgba(255,255,255,0.1)"
            tickStroke="rgba(255,255,255,0.1)"
            tickLabelProps={() => ({
              fill: 'rgba(255,255,255,0.4)',
              fontSize: 9,
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
      <defs>
        <linearGradient id="pressure-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.2} />
        </linearGradient>
      </defs>
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
