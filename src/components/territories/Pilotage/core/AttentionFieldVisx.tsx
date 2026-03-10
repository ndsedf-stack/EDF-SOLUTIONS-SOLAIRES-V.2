import React from 'react';

// --- TYPES ---
export type AttentionLevel = 'stable' | 'tension' | 'critical';

interface AttentionFieldVisxProps {
  level: AttentionLevel;
  active: number;
  closing: number;
  silent: number;
}

// --- CONFIG MAPPING (CINÉTIQUE - LOCKÉ) ---
const ATTENTION_CONFIG = {
  stable: {
    intensity: 1,
    fade: 0.1,
    blur: 6,
  },
  tension: {
    intensity: 0.7,
    fade: 0.35,
    blur: 12,
  },
  critical: {
    intensity: 0.4,
    fade: 0.6,
    blur: 18,
  },
};

const NODE_CONFIG = {
  active: {
    opacity: '0.7;0.75;0.7',
    blur: '8;6;8',
    scale: '1;1.02;1',
    duration: '10s',
  },
  closing: {
    opacity: '0.55;0.45;0.55',
    blur: '12;14;12',
    scale: '0.98;1;0.98',
    duration: '12s',
  },
  silent: {
    opacity: '0.25;0.15;0.25',
    blur: '18;22;18',
    scale: '0.9;0.88;0.9',
    duration: '14s',
  },
};

function AttentionNode({
  cx,
  cy,
  state,
}: {
  cx: number;
  cy: number;
  state: 'active' | 'closing' | 'silent';
}) {
  const c = NODE_CONFIG[state];
  const baseRadius = 90;

  // Conversion des échelles en rayons pour <animate attributeName="r">
  const rValues = c.scale.split(';').map(v => baseRadius * parseFloat(v)).join(';');

  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* Noyau Principal */}
      <circle r={baseRadius} fill="url(#attentionGlow)">
        <animate
          attributeName="opacity"
          values={c.opacity}
          dur={c.duration}
          repeatCount="indefinite"
        />
      </circle>

      {/* Aura Cinétique (Blur & Scale) */}
      <circle r={baseRadius} fill="url(#attentionGlow)" opacity="0.6">
        <animate
          attributeName="r"
          values={rValues}
          dur={c.duration}
          repeatCount="indefinite"
        />
        {/* Note: filter blur animation is handled via CSS in many modern browsers 
            or via separate filters. Here we use the user's logic for conceptual continuity. */}
        <animate
          attributeName="filter"
          values={c.blur.split(';').map(v => `blur(${v}px)`).join(';')}
          dur={c.duration}
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
}

export function AttentionFieldVisx({
  level,
  active,
  closing,
  silent,
}: AttentionFieldVisxProps) {
  const config = ATTENTION_CONFIG[level] || ATTENTION_CONFIG.stable;
  
  // Génération des positions pour les noeuds
  // On répartit les noeuds de manière organique
  const nodes: { id: string; state: 'active' | 'closing' | 'silent'; cx: number; cy: number }[] = [];
  
  const addNodes = (count: number, state: 'active' | 'closing' | 'silent', offset: number) => {
    for (let i = 0; i < count; i++) {
        const angle = ((nodes.length) / 8) * Math.PI * 2 + offset;
        const dist = 180 + (i % 2) * 40;
        nodes.push({
            id: `${state}-${i}`,
            state,
            cx: 500 + Math.cos(angle) * dist,
            cy: 300 + Math.sin(angle) * (dist * 0.6),
        });
    }
  };

  addNodes(active, 'active', 0);
  addNodes(closing, 'closing', 0.5);
  addNodes(silent, 'silent', 1);

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid slice"
      className="w-full h-full"
    >
      <defs>
        <radialGradient id="attentionGlow">
          <stop offset="0%" stopColor="#00D9FF" stopOpacity="1" />
          <stop offset="70%" stopColor="#00D9FF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00D9FF" stopOpacity="0" />
        </radialGradient>

        <filter id="attentionGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.05" />
          </feComponentTransfer>
        </filter>
      </defs>

      {/* FOND PROFOND */}
      <rect width="1000" height="600" fill="#070B18" />

      {/* NOYAUX CINÉTIQUES */}
      {nodes.map(node => (
        <AttentionNode key={node.id} cx={node.cx} cy={node.cy} state={node.state} />
      ))}

      {/* DISSIPATION SILENCIEUSE */}
      <rect
        width="1000"
        height="600"
        fill="#070B18"
        opacity={config.fade}
        pointerEvents="none"
      />
      
      {/* GRAIN PHYSIQUE */}
      <rect width="1000" height="600" filter="url(#attentionGrain)" opacity="0.2" pointerEvents="none" />
    </svg>
  );
}
