import React from 'react';

// --- TYPES ---
export type RiskLevel = 'stable' | 'tension' | 'critical';
export type RiskMode = 'cockpit' | 'board';

export interface RiskPressureVisxProps {
  level: RiskLevel;
  mode?: RiskMode;
  value?: number;
  secured?: number;
  waiting?: number;
  cancellable?: number;
}

// --- CONSTANTES VISUELLES ---
const LEVEL_CONFIG = {
  stable: {
    heightRatio: 0.25,
    pulse: 0,
    glow: 0.1,
  },
  tension: {
    heightRatio: 0.45,
    pulse: 1,
    glow: 0.25,
  },
  critical: {
    heightRatio: 0.68,
    pulse: 2,
    glow: 0.45,
  },
};

export function RiskPressureVisx({
  level,
  mode = 'cockpit',
}: RiskPressureVisxProps) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.stable;
  const isBoard = mode === 'board';

  // Board mode adjustments: slower animations, less grain, less glow.
  const pulseDuration = isBoard ? 8 : (6 - config.pulse * 2);
  const grainOpacity = isBoard ? 0.15 : 0.4;
  const glowDeviation = isBoard ? 8 : 18;

  return (
    <svg
      viewBox="0 0 1000 600"
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
    >
      <defs>
        {/* GRADIENT PRINCIPAL */}
        <linearGradient id="riskGradient" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={isBoard ? "#2A080A" : "#6A0F14"} />
          <stop offset="60%" stopColor={isBoard ? "#5A0A0D" : "#B31217"} />
          <stop offset="100%" stopColor={isBoard ? "#8B1218" : "#FF4757"} />
        </linearGradient>

        {/* GRAIN (Texture physique) */}
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues={`0 ${isBoard ? 0.015 : 0.04}`} />
          </feComponentTransfer>
        </filter>

        {/* GLOW INTERNE (Profondeur) */}
        <filter id="innerGlow">
          <feGaussianBlur stdDeviation={glowDeviation} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* FOND */}
      <rect width="1000" height="600" fill={isBoard ? "#0D1117" : "#080B16"} />

      {/* MASSE DE PRESSION */}
      <g transform={`translate(0, ${600 - 600 * config.heightRatio})`}>
        <rect
          width="1000"
          height={600 * config.heightRatio}
          fill="url(#riskGradient)"
          filter="url(#innerGlow)"
        />

        {/* GRAIN */}
        <rect
          width="1000"
          height={600 * config.heightRatio}
          filter="url(#grain)"
          opacity={grainOpacity}
        />
      </g>

      {/* PULSATION (Optionnelle en Board, mais plus lente) */}
      {(config.pulse > 0 || isBoard) && (
        <rect
          x="0"
          y={600 - 600 * config.heightRatio}
          width="1000"
          height={600 * config.heightRatio}
          fill="none"
          stroke={isBoard ? "#8B1218" : "#FF4757"}
          strokeWidth="1"
          opacity="0.2"
        >
          <animate
            attributeName="opacity"
            values="0.05;0.2;0.05"
            dur={`${pulseDuration}s`}
            repeatCount="indefinite"
          />
        </rect>
      )}
    </svg>
  );
}
