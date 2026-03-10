import React from 'react';

// --- TYPES ---
export type MomentumLevel = 'stable' | 'tension' | 'critical';

export interface MomentumFieldVisxProps {
  level: MomentumLevel;
  velocity: number;   // 0 to 1
  friction: number;   // 0 to 1
  blockage?: boolean;
}

export function MomentumFieldVisx({
  velocity,
  friction,
  blockage = false,
}: MomentumFieldVisxProps) {
  // Config des lignes de flux
  const lineCount = 12;
  const strokeWidth = 1.5;
  
  // La vitesse d'animation dépend de la velocity (plus c'est haut, plus c'est rapide)
  // Et de la friction (plus c'est haut, plus c'est lent)
  const baseSpeed = 15; // secondes pour traverser
  const speed = baseSpeed / (velocity * (1 - friction * 0.8) + 0.1);
  
  // Turbulence si blockage
  const turbulenceBase = blockage ? 0.05 : 0.01;

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
    >
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00D9FF" stopOpacity="0" />
          <stop offset="30%" stopColor="#00D9FF" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#00D9FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
        </linearGradient>

        <filter id="distort">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency={`${turbulenceBase} 0.01`} 
            numOctaves="2" 
            result="noise" 
          />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={blockage ? 40 : 10} />
        </filter>
        
        <filter id="momentumGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* FOND GRAPHIQUE */}
      <rect width="1000" height="600" fill="#070B18" />

      {/* LIGNES DE FLUX HORIZONTALES */}
      <g filter="url(#distort)">
        {Array.from({ length: lineCount }).map((_, i) => {
          const y = (i + 0.5) * (600 / lineCount);
          const dashArray = 200 + Math.random() * 300;
          const dashGap = 400 + Math.random() * 200;
          
          return (
            <line
              key={i}
              x1="-1000"
              y1={y}
              x2="2000"
              y2={y}
              stroke="url(#flowGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${dashArray} ${dashGap}`}
              filter="url(#momentumGlow)"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-2000"
                dur={`${speed + (i % 3)}s`}
                repeatCount="indefinite"
              />
            </line>
          );
        })}
      </g>

      {/* ZONE DE COMPRESSION (GOULOT) SI BLOCKAGE */}
      {blockage && (
        <rect 
          x="600" 
          y="0" 
          width="40" 
          height="600" 
          fill="rgba(255, 71, 87, 0.05)" 
          className="animate-pulse"
        />
      )}

      {/* GRAIN (COHÉRENCE DA) */}
      <filter id="momentumGrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.04" />
        </feComponentTransfer>
      </filter>
      <rect width="1000" height="600" filter="url(#momentumGrain)" opacity="0.3" pointerEvents="none" />
    </svg>
  );
}
