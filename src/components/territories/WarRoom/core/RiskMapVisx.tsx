import React, { useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleSqrt } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows } from '@visx/grid';
import { ParentSize } from '@visx/responsive';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { motion, AnimatePresence } from 'framer-motion';

export type WarRoomPoint = {
  studyId: string;
  name: string;
  daysBeforeDeadline: number;
  totalPrice: number;
  dangerScore: number;
  engagementScore: number;
};

export interface RiskMapProps {
  studies: WarRoomPoint[];
  onPointClick?: (studyId: string) => void;
  highlightedStudyId?: string | null;
}

interface RiskMapInnerProps extends RiskMapProps {
  width: number;
  height: number;
}

// 🎨 THEME OPTIMISÉ (PLUS SOBRE & PREMIUM)
const THEME = {
  colors: {
    background: 'transparent',
    grid: 'rgba(255, 255, 255, 0.05)',
    axis: 'rgba(255, 255, 255, 0.15)',
    text: 'rgba(255, 255, 255, 0.3)',
    textLight: 'rgba(255, 255, 255, 0.5)',
    bubbles: {
      safe: 'rgba(74, 222, 128, 0.6)',      // Green 400
      warning: 'rgba(251, 191, 36, 0.6)',   // Amber 400
      danger: 'rgba(248, 113, 113, 0.7)',   // Red 400
      critical: 'rgba(239, 68, 68, 0.8)'    // Red 500
    }
  },
  fonts: {
    axis: '"Inter", "SF Pro Display", -apple-system, sans-serif',
  }
};

const RiskMapInner = ({ studies, width, height, onPointClick, highlightedStudyId }: RiskMapInnerProps) => {
  // 1. MARGES OPTIMISÉES (Gagne de l'espace gauche)
  const margin = { top: 40, right: 60, bottom: 60, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (width < 10 || height < 10) return null;

  const {
      showTooltip,
      hideTooltip,
      tooltipData,
      tooltipLeft = 0,
      tooltipTop = 0,
  } = useTooltip<WarRoomPoint>();

  // 2. ANALYSE STRATÉGIQUE (Focus automatique)
  const criticalStudy = useMemo(() => {
    if (studies.length === 0) return null;
    return studies.reduce((a, b) => a.dangerScore > b.dangerScore ? a : b);
  }, [studies]);

  const topEnjeuStudy = useMemo(() => {
    if (studies.length === 0) return null;
    return studies.reduce((a, b) => a.totalPrice > b.totalPrice ? a : b);
  }, [studies]);

  // 2. SCALES CORRIGÉES
  const xScale = useMemo(() => scaleLinear({
    domain: [14, 0],
    range: [0, innerWidth],
    nice: true,
  }), [innerWidth]);

  const yMax = Math.max(...studies.map(d => d.totalPrice), 20000);
  const yScale = useMemo(() => scaleLinear({
    domain: [0, yMax * 1.1],
    range: [innerHeight, 0],
    nice: true,
  }), [yMax, innerHeight]);

  // 2b. JITTER LOGIC (Detect & Offset overlapping points)
  const studiesWithOffset = useMemo(() => {
    const coordsMap = new Map<string, number>();
    return studies.map(s => {
      const key = `${s.daysBeforeDeadline}-${s.totalPrice}`;
      const index = coordsMap.get(key) || 0;
      coordsMap.set(key, index + 1);

      let dx = 0;
      let dy = 0;
      if (index > 0) {
        // Multi-bubble case: Spiral bloom pattern in pixels
        const angle = index * (Math.PI * 0.7); // Spread angle
        const distance = index * 12; // Step distance
        dx = Math.cos(angle) * distance;
        dy = Math.sin(angle) * distance;
      }
      return { ...s, dx, dy };
    });
  }, [studies]);

  // TAILLE BULLES: Scale Sqrt (Perception correcte des aires)
  const sizeScale = useMemo(() => scaleSqrt({
    domain: [0, 100],
    range: [6, 24], 
  }), []);

  const getBubbleColor = (score: number) => {
    if (score < 40) return THEME.colors.bubbles.safe;
    if (score < 60) return THEME.colors.bubbles.warning;
    if (score < 80) return THEME.colors.bubbles.danger;
    return THEME.colors.bubbles.critical;
  };

  const handleTooltip = (event: React.MouseEvent<SVGCircleElement> | React.TouchEvent<SVGCircleElement>, study: WarRoomPoint, finalX: number, finalY: number) => {
      showTooltip({
          tooltipData: study,
          tooltipLeft: finalX + margin.left,
          tooltipTop: finalY + margin.top,
      });
  };

  return (
    <>
      <svg width={width} height={height} className="overflow-visible">
        <Group left={margin.left} top={margin.top}>
          
          {/* 3. SEMANTIC LABELS (Zero-chrome approach) */}
          <text x={15} y={innerHeight - 15} fill={THEME.colors.bubbles.safe} fontSize={9} fontWeight={700} letterSpacing="0.1em" opacity={0.3}>ZONE SÉCURISÉE</text>
          <text x={innerWidth / 2} y={innerHeight - 15} fill={THEME.colors.bubbles.warning} fontSize={9} fontWeight={700} letterSpacing="0.1em" textAnchor="middle" opacity={0.3}>ZONE DE VIGILANCE</text>
          <text x={innerWidth - 15} y={25} fill={THEME.colors.bubbles.critical} fontSize={9} fontWeight={700} letterSpacing="0.1em" textAnchor="end" opacity={0.5}>URGENCE CRITIQUE</text>

          {/* INDICATEUR D'URGENCE (Storytelling Axe X) */}
          <text 
             x={innerWidth} 
             y={innerHeight + 40} 
             fill={THEME.colors.bubbles.critical} 
             fontSize={10} 
             fontWeight={900} 
             textAnchor="end"
             letterSpacing="0.05em"
          >
             URGENCE ACCRUE →
          </text>

          {/* GRID (Léger & Horizontal seulement) */}
          <GridRows 
            scale={yScale} 
            width={innerWidth} 
            stroke={THEME.colors.grid} 
            strokeDasharray="4,4" 
          />

          {/* AXES (Discrets & Élégants) */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            numTicks={5}
            stroke={THEME.colors.axis}
            tickStroke={THEME.colors.axis}
            tickLabelProps={() => ({
              fill: THEME.colors.text,
              fontSize: 10,
              fontFamily: THEME.fonts.axis,
              textAnchor: 'middle',
              fontWeight: 600
            })}
          />
          <AxisLeft
            scale={yScale}
            numTicks={4}
            stroke="transparent"
            tickStroke="transparent"
            tickLabelProps={() => ({
              fill: THEME.colors.text,
              fontSize: 10,
              fontFamily: THEME.fonts.axis,
              textAnchor: 'end',
              verticalAnchor: 'middle',
              fontWeight: 600,
              dx: -10
            })}
            tickFormat={d => `${Math.round(d as number / 1000)}k€`}
          />

          {/* BULLES (Animations douces & Cockpit Logic) */}
          <AnimatePresence>
            {studiesWithOffset.map((study) => {
                const isHighlighted = highlightedStudyId === study.studyId;
                const isCriticalPoint = criticalStudy?.studyId === study.studyId;
                const isTopEnjeu = topEnjeuStudy?.studyId === study.studyId;
                
                const baseX = xScale(study.daysBeforeDeadline);
                const baseY = yScale(study.totalPrice);
                const finalX = baseX + study.dx;
                const finalY = baseY + study.dy;

                return (
                    <Group key={study.studyId}>
                       {/* ANNOTATION TOP ENJEU (Storytelling) */}
                       {isTopEnjeu && (
                           <motion.g
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 0.6 }}
                             transition={{ delay: 1 }}
                           >
                               <line 
                                 x1={finalX} 
                                 y1={finalY - sizeScale(study.engagementScore) - 4}
                                 x2={finalX}
                                 y2={finalY - sizeScale(study.engagementScore) - 20}
                                 stroke={THEME.colors.textLight}
                                 strokeWidth={0.5}
                               />
                               <text
                                 x={finalX}
                                 y={finalY - sizeScale(study.engagementScore) - 25}
                                 fill={THEME.colors.textLight}
                                 fontSize={8}
                                 fontWeight={800}
                                 textAnchor="middle"
                                 letterSpacing="0.05em"
                               >
                                 PLUS GROS ENJEU
                               </text>
                           </motion.g>
                       )}

                        <motion.circle
                          cx={finalX}
                          cy={finalY}
                          r={sizeScale(study.engagementScore)}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: 1, 
                            scale: isHighlighted ? 1.4 : isCriticalPoint ? 1.2 : 1,
                            strokeOpacity: isHighlighted || isCriticalPoint ? 1 : 0.2
                          }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                          fill={getBubbleColor(study.dangerScore)}
                          stroke={isCriticalPoint ? "white" : "white"}
                          strokeWidth={isHighlighted ? 3 : isCriticalPoint ? 2 : 1}
                          style={{ cursor: 'pointer', zIndex: isHighlighted ? 100 : 1 }}
                          whileHover={{ scale: 1.5, strokeOpacity: 1 }}
                          onMouseEnter={(e: any) => handleTooltip(e, study, finalX, finalY)}
                          onMouseLeave={() => hideTooltip()}
                          onClick={() => onPointClick && onPointClick(study.studyId)}
                        />
                    </Group>
                );
            })}
          </AnimatePresence>
        </Group>
      </svg>

      {/* RICH TOOLTIP (Stable Key) */}
      {tooltipData && (
        <TooltipWithBounds
          key="tooltip" 
          top={tooltipTop - 8}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: '#0F1629',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            zIndex: 100,
          }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.15em] mb-0.5">Focus Dossier</span>
            <p className="text-[11px] font-bold text-white tracking-tight leading-tight">
              {tooltipData.name}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex flex-col">
                <span className="text-[7px] text-white/20 uppercase font-black">Potentiel</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {Math.round(tooltipData.totalPrice).toLocaleString()}€
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] text-white/20 uppercase font-black">Score</span>
                <span className="text-[10px] text-red-400 font-mono">{tooltipData.dangerScore}/100</span>
              </div>
            </div>
          </div>
        </TooltipWithBounds>
      )}
    </>
  );
};

export function RiskMapVisx({ studies, onPointClick, highlightedStudyId }: RiskMapProps) {
  return (
    <div style={{ width: '100%', height: '65vh', minHeight: '500px' }}>
      <ParentSize>
        {({ width, height }) => (
            <RiskMapInner 
                studies={studies} 
                width={width} 
                height={height} 
                onPointClick={onPointClick} 
                highlightedStudyId={highlightedStudyId}
            />
        )}
      </ParentSize>
    </div>
  );
}
