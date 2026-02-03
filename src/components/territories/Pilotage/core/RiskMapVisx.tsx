import React from 'react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { useTooltip, TooltipWithBounds } from '@visx/tooltip';

export interface RiskDeal {
  id: string;
  clientName: string;
  amount: number;
  daysSilent: number;
  probability: number;
}

interface Props {
  data: RiskDeal[];
  width?: number;
  height?: number;
  onSelectDeal?: (deal: RiskDeal) => void;
}

export function RiskMapVisx({
  data,
  width = 900,
  height = 400,
  onSelectDeal
}: Props) {
  const margin = { top: 40, right: 260, bottom: 60, left: 80 };

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip<RiskDeal>();

  const xScale = scaleLinear({
    domain: [0, 30],
    range: [margin.left, width - margin.right],
  });

  const yMax = Math.max(...data.map(d => d.amount), 5000);

  const yScale = scaleLinear({
    domain: [0, yMax],
    range: [height - margin.bottom, margin.top],
    nice: true,
  });

  return (
    <div className="relative" style={{ width, height }}>
      <svg width={width} height={height} className="bg-[#0A0E27] cursor-crosshair">
        
        {/* ZONES DE BATAILLE (FILIGRANE) */}
        {/* ZONES DE BATAILLE (FILIGRANE + ACTIONS PRESCRIPTIVES) */}
        {/* ✅ AUDIT FIX ID: NO_ACTION & UNREADABLE_ZONES */}
        <Group>
            {/* ZONE 1: SÉCURISER (Risque Faible) */}
            <rect x={xScale(0)} width={xScale(7) - xScale(0)} y={margin.top} height={height - margin.top - margin.bottom} fill="#4ADE80" fillOpacity={0.06} />
            <text x={xScale(3.5)} y={height - margin.bottom + 40} fill="#4ADE80" fillOpacity={0.9} fontSize={14} fontWeight="900" textAnchor="middle" className="uppercase tracking-widest font-sans">
              SÉCURISER
            </text>
            <text x={xScale(3.5)} y={height - margin.bottom + 54} fill="#4ADE80" fillOpacity={0.6} fontSize={10} fontWeight="bold" textAnchor="middle" className="uppercase tracking-wider font-mono">
              (ACCEPTER)
            </text>
            
            {/* ZONE 2: SURVEILLER (Tension) */}
            <rect x={xScale(7)} width={xScale(14) - xScale(7)} y={margin.top} height={height - margin.top - margin.bottom} fill="#FB923C" fillOpacity={0.06} />
            <text x={xScale(10.5)} y={height - margin.bottom + 40} fill="#FB923C" fillOpacity={0.9} fontSize={14} fontWeight="900" textAnchor="middle" className="uppercase tracking-widest font-sans">
              SURVEILLER
            </text>
            <text x={xScale(10.5)} y={height - margin.bottom + 54} fill="#FB923C" fillOpacity={0.6} fontSize={10} fontWeight="bold" textAnchor="middle" className="uppercase tracking-wider font-mono">
              (CONTRÔLER)
            </text>
            
            {/* ZONE 3: INTERVENIR (Critique) */}
            <rect x={xScale(14)} width={width - margin.right - xScale(14)} y={margin.top} height={height - margin.top - margin.bottom} fill="#F87171" fillOpacity={0.1} />
            <text x={xScale(22)} y={height - margin.bottom + 40} fill="#F87171" fillOpacity={1} fontSize={14} fontWeight="900" textAnchor="middle" className="uppercase tracking-widest font-sans">
              INTERVENIR
            </text>
            <text x={xScale(22)} y={height - margin.bottom + 54} fill="#F87171" fillOpacity={0.7} fontSize={10} fontWeight="bold" textAnchor="middle" className="uppercase tracking-wider font-mono">
              (STOPPER)
            </text>
        </Group>

        <Group>
          {/* AXES AUSTÈRES */}
          <AxisBottom
            top={height - margin.bottom}
            scale={xScale}
            stroke="#ffffff10"
            tickStroke="#ffffff10"
            tickLabelProps={() => ({
              fill: '#ffffff40',
              fontSize: 11,
              fontFamily: 'IBM Plex Mono',
              textAnchor: 'middle',
            })}
            tickValues={[0, 7, 14, 21, 30]}
            tickFormat={d => `${d}j`}
            label="Dernier signal (jours) →"
            labelProps={{
                fill: '#ffffff30',
                fontSize: 11,
                fontFamily: 'Manrope',
                fontWeight: 'bold',
                textAnchor: 'middle',
                letterSpacing: 2
            }}
          />
          <AxisLeft
            left={margin.left}
            scale={yScale}
            stroke="#ffffff10"
            tickStroke="#ffffff10"
            tickLabelProps={() => ({
              fill: '#ffffff40',
              fontSize: 11,
              fontFamily: 'IBM Plex Mono',
              textAnchor: 'end',
              verticalAnchor: 'middle',
            })}
            tickFormat={d => `${Math.round((d as number) / 1000)}k€`}
          />

          {/* POINTS (DEALS) */}
          {data.map((d) => (
            <circle
              key={d.id}
              cx={xScale(d.daysSilent)}
              cy={yScale(d.amount)}
              r={6 + d.probability * 14}
              fill={d.daysSilent > 14 ? '#F87171' : d.daysSilent > 7 ? '#FB923C' : '#38BDF8'}
              fillOpacity={0.6}
              stroke="white"
              strokeWidth={tooltipData?.id === d.id ? 2 : 0}
              className="transition-all duration-200 hover:fill-opacity-100"
              onMouseEnter={() => {
                showTooltip({
                  tooltipData: d,
                  tooltipLeft: width - 240,
                  tooltipTop: margin.top,
                });
              }}
              onMouseLeave={hideTooltip}
              onClick={() => onSelectDeal?.(d)}
            />
          ))}
        </Group>
      </svg>

      {/* TOOLTIP LATÉRAL FIXE (RÉVÉLATION DE LA CIBLE) */}
      {tooltipData && (
        <TooltipWithBounds
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            background: '#0F1629',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px',
            color: '#fff',
            width: '240px',
            boxShadow: 'none',
          }}
        >
          <div className="flex flex-col gap-6 font-sans">
            <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                <span className="text-[10px] uppercase font-bold text-white/20 tracking-[0.2em]">Cible sélectionnée</span>
                <div className="text-xl font-extrabold font-manrope truncate">{tooltipData.clientName}</div>
                <div className="text-xs font-mono text-white/40">{tooltipData.id}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-white/20 mb-1">Montant</span>
                    <span className="text-sm font-manrope font-black">{(tooltipData.amount).toLocaleString()}€</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-white/20 mb-1">Silence</span>
                    <span className="text-sm font-manrope font-black">{tooltipData.daysSilent}j</span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-[9px] uppercase font-bold text-white/20">Probabilité d'annulation</span>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                        className="h-full transition-all duration-500" 
                        style={{ 
                            width: `${tooltipData.probability * 100}%`,
                            backgroundColor: tooltipData.probability > 0.7 ? '#F87171' : tooltipData.probability > 0.4 ? '#FB923C' : '#4ADE80'
                        }} 
                    />
                </div>
                <span className="text-[10px] font-mono font-bold text-right italic opacity-40">{Math.round(tooltipData.probability * 100)}%</span>
            </div>
          </div>
        </TooltipWithBounds>
      )}
    </div>
  );
}
