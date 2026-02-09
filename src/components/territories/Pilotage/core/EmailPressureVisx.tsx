import React from 'react';
import { Group } from '@visx/group';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { ParentSize } from '@visx/responsive';
import { AxisBottom } from '@visx/axis';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';

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

const COLORS_MAP = {
  clicked: '#3DDC97', // Emerald (Success)
  opened: '#7CA3BA',  // Blue-grey (Interest)
  sentNeg: '#2A3142'  // Dark slate (Noise/Sent only)
};

const EmailPressureContent: React.FC<EmailPressureVisxProps & { width: number; height: number }> = ({ 
  data, 
  width, 
  height 
}) => {
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<any>();

  const margin = { top: 15, bottom: 25, left: 10, right: 10 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // 1. TRANSFORM DATA
  const transformedData = data.map(d => ({
    date: d.date,
    originalTotal: d.count,
    originalOpened: d.opened || 0,
    originalClicked: d.clicked || 0
  }));

  const xScale = scaleBand<string>({
    range: [0, xMax],
    round: true,
    domain: transformedData.map((d) => d.date),
    padding: 0.4,
  });

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    round: true,
    domain: [0, Math.max(...data.flatMap((d) => [d.count, d.opened || 0, d.clicked || 0])) || 10],
  });



  return (
    <div className="relative">
      <svg width={width} height={height}>
        <Group top={margin.top} left={margin.left}>
          


          {transformedData.map((d) => {
            const groupWidth = xScale.bandwidth();
            const x0 = xScale(d.date) || 0;
            const barGap = 1;
            const barWidth = (groupWidth - barGap * 2) / 3;
            
            // Heights
            const sentHeight = yMax - yScale(d.originalTotal);
            const openedHeight = yMax - yScale(d.originalOpened);
            const clickedHeight = yMax - yScale(d.originalClicked);

            return (
              <Group key={`bar-group-${d.date}`} left={x0}>
                {/* 1. SENT (Left) */}
                <rect
                  x={0}
                  y={yMax - sentHeight}
                  width={barWidth}
                  height={sentHeight}
                  fill={COLORS_MAP.sentNeg}
                  rx={2}
                  opacity={0.8}
                  onMouseMove={(event) => {
                    const point = localPoint(event) || { x: 0, y: 0 };
                    showTooltip({
                      tooltipData: d,
                      tooltipLeft: point.x,
                      tooltipTop: point.y,
                    });
                  }}
                  onMouseLeave={() => hideTooltip()}
                  style={{ cursor: 'pointer' }}
                />

                {/* 2. OPENED (Middle) */}
                <rect
                  x={barWidth + barGap}
                  y={yMax - openedHeight}
                  width={barWidth}
                  height={openedHeight}
                  fill={COLORS_MAP.opened}
                  rx={2}
                  opacity={0.9}
                  style={{ 
                    filter: 'drop-shadow(0 0 3px rgba(124,163,186,0.3))',
                    cursor: 'pointer' 
                  }}
                  onMouseMove={(event) => {
                    const point = localPoint(event) || { x: 0, y: 0 };
                    showTooltip({
                      tooltipData: d,
                      tooltipLeft: point.x,
                      tooltipTop: point.y,
                    });
                  }}
                  onMouseLeave={() => hideTooltip()}
                />

                {/* 3. CLICKED (Right) */}
                <rect
                  x={(barWidth + barGap) * 2}
                  y={yMax - clickedHeight}
                  width={barWidth}
                  height={clickedHeight}
                  fill={COLORS_MAP.clicked}
                  rx={2}
                  opacity={1}
                  style={{ 
                    filter: 'drop-shadow(0 0 4px rgba(61,220,151,0.4))',
                    cursor: 'pointer' 
                  }}
                  onMouseMove={(event) => {
                    const point = localPoint(event) || { x: 0, y: 0 };
                    showTooltip({
                      tooltipData: d,
                      tooltipLeft: point.x,
                      tooltipTop: point.y,
                    });
                  }}
                  onMouseLeave={() => hideTooltip()}
                />
              </Group>
            );
          })}

          <AxisBottom
              top={yMax}
              scale={xScale}
              stroke="rgba(255,255,255,0.1)"
              tickStroke="rgba(255,255,255,0.1)"
              tickLabelProps={() => ({
                fill: '#ffffff',
                fontSize: 10,
                opacity: 0.5,
                textAnchor: 'middle',
                fontFamily: 'sans-serif',
                fontWeight: 500,
              })}
              tickFormat={(dateString) => {
                 const date = new Date(dateString as string);
                 return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'numeric' });
              }}
            />
        </Group>
      </svg>
      {tooltipData && (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            fontSize: '11px',
            backdropFilter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mb-1">
               {new Date(tooltipData.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500 font-bold uppercase">Emails Envoyés</span>
              <span className="font-mono text-white">{tooltipData.originalTotal}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-indigo-400 font-bold uppercase">Emails Ouverts</span>
              <span className="font-mono text-white">{tooltipData.originalOpened}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#3DDC97] font-bold uppercase">Emails Cliqués</span>
              <span className="font-mono text-white font-bold">{tooltipData.originalClicked}</span>
            </div>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
};

export const EmailPressureVisx: React.FC<EmailPressureVisxProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-48 rounded-2xl p-6 border flex flex-col justify-between backdrop-blur-xl" style={{
      background: 'rgba(255,255,255,0.03)',
      borderColor: 'rgba(255,255,255,0.08)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)'
    }}>
      <div className="flex justify-between items-start mb-2">
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

         {/* LÉGENDE DÉPORTÉE DANS LE HEADER (SAFE) */}
         <div className="flex items-center gap-4 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS_MAP.sentNeg, opacity: 0.8 }}></div>
               <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Envoyés</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS_MAP.opened, opacity: 0.9 }}></div>
               <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Ouverts</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS_MAP.clicked, opacity: 0.95 }}></div>
               <span className="text-[9px] text-[#3DDC97] font-bold uppercase tracking-wider">Cliqués</span>
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
