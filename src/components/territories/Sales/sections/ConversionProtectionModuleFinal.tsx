import React, { useMemo, useState } from "react";

interface DataPoint {
  label: string;
  creation: number;   // leads / CA généré
  protection: number; // CA sécurisé
}

interface Props {
  data: DataPoint[];
  securedRevenue: number;
  cycleBefore?: number;
  cycleNow?: number;
  savedHours?: number;
}

/**
 * FULL FINAL MODULE
 * Boardroom + Cockpit Sales + Storytelling Client
 * Concept conservé : Création vs Protection CA
 */
export default function ConversionProtectionModuleFinal({
  data,
  securedRevenue,
  cycleBefore,
  cycleNow,
  savedHours
}: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Separate max values for each metric
  const maxCreation = useMemo(() => {
    return Math.max(...data.map(d => d.creation), 1); // At least 1 to avoid division by zero
  }, [data]);

  const maxProtection = useMemo(() => {
    return Math.max(...data.map(d => d.protection), 1);
  }, [data]);

  const cycleDelta = cycleBefore && cycleNow
    ? Math.round(((cycleNow - cycleBefore) / cycleBefore) * 100)
    : null;

  // Graph dimensions with margins for axes
  const margin = { top: 40, right: 80, bottom: 60, left: 80 };
  const width = 800;
  const height = 300;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Separate scale functions for each metric
  const scaleYCreation = (v: number) => innerHeight - (v / maxCreation) * innerHeight;
  const scaleYProtection = (v: number) => innerHeight - (v / maxProtection) * innerHeight;

  const buildPath = (key: "creation" | "protection") => {
    const scaleY = key === "creation" ? scaleYCreation : scaleYProtection;
    return data
      .map((d, i) => {
        const x = (i / (data.length - 1)) * innerWidth;
        const y = scaleY(d[key]);
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  };

  const creationPath = buildPath("creation");
  const protectionPath = buildPath("protection");

  const narrative = useMemo(() => {
    const last = data[data.length - 1];
    if (!last) return "";

    if (last.protection > last.creation)
      return "Le système protège désormais plus de chiffre d'affaires qu'il n'en génère : effet défensif confirmé.";

    if (last.protection > last.creation * 0.7)
      return "La protection du CA devient un levier stratégique majeur.";

    return "Le système agit surtout en acquisition : potentiel défensif encore sous‑exploité.";
  }, [data]);

  // Generate Y-axis ticks for each scale
  const yTicksCreation = useMemo(() => {
    const tickCount = 5;
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      const value = (maxCreation / tickCount) * i;
      ticks.push(value);
    }
    return ticks;
  }, [maxCreation]);

  const yTicksProtection = useMemo(() => {
    const tickCount = 5;
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      const value = (maxProtection / tickCount) * i;
      ticks.push(value);
    }
    return ticks;
  }, [maxProtection]);

  return (
    <section className="w-full rounded-2xl bg-[#0b0e14] border border-white/10 p-8 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)]">

      {/* HERO KPI */}
      <header className="mb-10">
        <div className="text-xs uppercase tracking-[0.35em] text-white/30 mb-3">
          Performance commerciale autonome
        </div>

        <div className="flex items-end gap-6 flex-wrap">
          <h1 className="text-7xl font-bold leading-none">
            {(securedRevenue / 1000).toFixed(0)}k€
          </h1>
          <p className="text-white/50 max-w-sm pb-2">
            Chiffre d'affaires sécurisé automatiquement
          </p>
        </div>
      </header>

      {/* GRAPH WITH AXES */}
      <div className="mb-10 bg-[#0f141f] rounded-xl p-6 border border-white/5 relative">
        
        {/* Legend */}
        <div className="flex gap-6 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#3ecfff]"></div>
            <span className="text-white/60">Création (Clients uniques)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-[#7cffb2]"></div>
            <span className="text-white/60">Protection (CA Sécurisé)</span>
          </div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          <g transform={`translate(${margin.left},${margin.top})`}>
            
            {/* Grid lines - use protection scale */}
            {yTicksProtection.map((tick, i) => (
              <line
                key={i}
                x1={0}
                y1={scaleYProtection(tick)}
                x2={innerWidth}
                y2={scaleYProtection(tick)}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="2,4"
              />
            ))}

            {/* Y-axis (left) - Creation */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={innerHeight}
              stroke="rgba(62,207,255,0.3)"
              strokeWidth={1}
            />
            {yTicksCreation.map((tick, i) => (
              <g key={i}>
                <text
                  x={-10}
                  y={scaleYCreation(tick)}
                  fill="rgba(62,207,255,0.6)"
                  fontSize={10}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fontFamily="IBM Plex Mono"
                >
                  {Math.round(tick)}
                </text>
              </g>
            ))}
            <text
              x={-60}
              y={innerHeight / 2}
              fill="rgba(62,207,255,0.6)"
              fontSize={11}
              textAnchor="middle"
              transform={`rotate(-90, -60, ${innerHeight / 2})`}
              fontFamily="IBM Plex Mono"
            >
              CLIENTS
            </text>

            {/* Y-axis (right) - Protection */}
            <line
              x1={innerWidth}
              y1={0}
              x2={innerWidth}
              y2={innerHeight}
              stroke="rgba(124,255,178,0.3)"
              strokeWidth={1}
            />
            {yTicksProtection.map((tick, i) => (
              <text
                key={i}
                x={innerWidth + 10}
                y={scaleYProtection(tick)}
                fill="rgba(124,255,178,0.6)"
                fontSize={10}
                textAnchor="start"
                dominantBaseline="middle"
                fontFamily="IBM Plex Mono"
              >
                {Math.round(tick / 1000)}k€
              </text>
            ))}
            <text
              x={innerWidth + 60}
              y={innerHeight / 2}
              fill="rgba(124,255,178,0.6)"
              fontSize={11}
              textAnchor="middle"
              transform={`rotate(90, ${innerWidth + 60}, ${innerHeight / 2})`}
              fontFamily="IBM Plex Mono"
            >
              CA PROTÉGÉ
            </text>

            {/* X-axis */}
            <line
              x1={0}
              y1={innerHeight}
              x2={innerWidth}
              y2={innerHeight}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
            />
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * innerWidth;
              return (
                <text
                  key={i}
                  x={x}
                  y={innerHeight + 20}
                  fill="rgba(255,255,255,0.4)"
                  fontSize={10}
                  textAnchor="middle"
                  fontFamily="IBM Plex Mono"
                >
                  {d.label}
                </text>
              );
            })}

            {/* Creation line */}
            <path
              d={creationPath}
              fill="none"
              stroke="#3ecfff"
              strokeWidth="3"
              opacity="0.85"
            />

            {/* Protection line */}
            <path
              d={protectionPath}
              fill="none"
              stroke="#7cffb2"
              strokeWidth="3"
              opacity="0.9"
            />

            {/* Interactive points */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * innerWidth;
              const yProtection = scaleYProtection(d.protection);
              const yCreation = scaleYCreation(d.creation);

              return (
                <g key={i}>
                  <circle
                    cx={x}
                    cy={yCreation}
                    r={hoverIndex === i ? 5 : 3}
                    fill="#3ecfff"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                    style={{ cursor: 'pointer' }}
                  />
                  <circle
                    cx={x}
                    cy={yProtection}
                    r={hoverIndex === i ? 6 : 4}
                    fill="#7cffb2"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {hoverIndex !== null && (
          <div className="absolute bottom-4 left-6 text-xs bg-black/90 px-4 py-3 rounded-lg border border-white/20">
            <div className="font-bold mb-1">{data[hoverIndex].label}</div>
            <div className="text-[#3ecfff]">Leads: {data[hoverIndex].creation}</div>
            <div className="text-[#7cffb2]">CA Protégé: {(data[hoverIndex].protection / 1000).toFixed(0)}k€</div>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">

        {cycleNow !== undefined && (
          <div className="bg-white/[0.04] p-6 rounded-xl border border-white/10">
            <div className="text-xs text-white/40 uppercase mb-1">
              Cycle commercial
            </div>
            <div className="text-4xl font-bold">
              {cycleNow} jours
            </div>
            {cycleDelta !== null && cycleDelta !== 0 && (
              <div className={`text-sm mt-1 ${cycleDelta < 0 ? "text-emerald-400" : "text-red-400"}`}>
                {cycleDelta > 0 ? '+' : ''}{cycleDelta}% vs avant
              </div>
            )}
          </div>
        )}

        {savedHours !== undefined && savedHours > 0 && (
          <div className="bg-white/[0.04] p-6 rounded-xl border border-white/10">
            <div className="text-xs text-white/40 uppercase mb-1">
              Temps libéré
            </div>
            <div className="text-4xl font-bold">
              {savedHours}h
            </div>
            <div className="text-white/40 text-sm">
              Capacité commerciale récupérée
            </div>
          </div>
        )}

        <div className="bg-white/[0.04] p-6 rounded-xl border border-white/10">
          <div className="text-xs text-white/40 uppercase mb-1">
            Lecture stratégique
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            {narrative}
          </p>
        </div>

      </div>

      {/* ACTION */}
      <footer className="border-t border-white/10 pt-6">
        <p className="text-sm text-white/70">
          👉 Priorité : renforcer la protection du CA existant avant d'augmenter l'acquisition.
        </p>
      </footer>
    </section>
  );
}
