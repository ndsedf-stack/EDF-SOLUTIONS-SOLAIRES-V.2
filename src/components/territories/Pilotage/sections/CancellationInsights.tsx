import React, { useMemo } from 'react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { Pie } from '@visx/shape';
import { Group } from '@visx/group';
import { Text } from '@visx/text';

interface CancellationInsightsProps {
  studies: any[];
}

export function CancellationInsights({ studies }: CancellationInsightsProps) {
  
  // 1. Filter Cancelled Studies
  const cancelledStudies = useMemo(() => {
    return studies.filter((s: any) => s.status === 'cancelled' || s.status === 'refused');
  }, [studies]);

  // 2. Categorize by Real Reason (Priority) or Loss Stage (Fallback)
  const data = useMemo(() => {
    // Aggregation Map
    const counts: Record<string, number> = {
      'Ignoré (Avant Vue)': 0,
      'Refusé (Après Vue)': 0,
      'Rétractation (Post-Sign)': 0, // Fallback historical
      // Real reasons will be added dynamically
    };
    
    // Color mapping for known reasons
    const colorMap: Record<string, string> = {
      'Ignoré (Avant Vue)': '#64748b', // Slate
      'Refusé (Après Vue)': '#f97316', // Orange
      'Rétractation (Post-Sign)': '#ef4444', // Red
      
      'Trop cher / Budget': '#eab308', // Yellow
      'Raison Technique / Toiture': '#8b5cf6', // Violet
      'Concurrent moins cher': '#f43f5e', // Pink
      'Refus Client / Ne répond plus': '#f97316', // Orange
      'Projet Abandonné': '#64748b', // Slate
      'Erreur de saisie / Doublon': '#10b981', // Emerald
    };

    cancelledStudies.forEach((s: any) => {
      // 1. Check for EXPLICIT REASON (New System)
      const realReason = s.study_data?.cancellation_reason;
      
      if (realReason) {
        counts[realReason] = (counts[realReason] || 0) + 1;
      } else {
        // 2. Fallback to PROXY LOGIC (Old Data)
        if (s.signed_at) {
          counts['Rétractation (Post-Sign)']++;
        } else if (s.views > 0) {
          counts['Refusé (Après Vue)']++;
        } else {
          counts['Ignoré (Avant Vue)']++;
        }
      }
    });

    // Transform to Visx format
    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value,
        color: colorMap[label] || '#94a3b8' // Default gray
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value); // Sort by frequency
  }, [cancelledStudies]);

  const total = cancelledStudies.length;

  return (
    <div className="flex flex-col md:flex-row gap-8 items-center">
        
        {/* CHART SIDE */}
        <div className="w-full md:w-1/3 h-[250px] relative">
             <ParentSize>
               {({ width, height }) => {
                 const radius = Math.min(width, height) / 2;
                 const centerY = height / 2;
                 const centerX = width / 2;
                 
                 return (
                   <svg width={width} height={height}>
                     <Group top={centerY} left={centerX}>
                       <Pie
                         data={data}
                         pieValue={(d) => d.value}
                         outerRadius={radius}
                         innerRadius={radius - 40}
                         cornerRadius={3}
                         padAngle={0.02}
                       >
                         {(pie) => {
                           return pie.arcs.map((arc, i) => {
                             const [centroidX, centroidY] = pie.path.centroid(arc);
                             const { label, value, color } = arc.data;
                             return (
                               <g key={`arc-${label}-${i}`}>
                                 <path d={pie.path(arc) || ''} fill={color} />
                                 <text
                                   x={centroidX}
                                   y={centroidY}
                                   dy=".33em"
                                   fill="#ffffff"
                                   fontSize={10}
                                   textAnchor="middle"
                                   fontWeight="bold"
                                 >
                                   {value}
                                 </text>
                               </g>
                             );
                           });
                         }}
                       </Pie>
                       <Text verticalAnchor="middle" textAnchor="middle" fill="#fff" fontSize={24} fontWeight="bold">
                          {total}
                       </Text>
                       <Text y={20} verticalAnchor="middle" textAnchor="middle" fill="#94a3b8" fontSize={10} fontWeight="bold" letterSpacing={1}>
                          PERDUS
                       </Text>
                     </Group>
                   </svg>
                 );
               }}
             </ParentSize>
        </div>

        {/* LEGEND / INSIGHT SIDE */}
        <div className="w-full md:w-2/3 space-y-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Répartition des Échecs</h3>
            <p className="text-sm text-slate-400">
               Analyse automatique basée sur le stade d'avancement du dossier au moment de l'annulation.
            </p>

            <div className="space-y-3">
                {data.map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-sm font-bold text-slate-200">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-mono text-slate-500">
                                {Math.round((item.value / total) * 100)}%
                            </span>
                            <span className="text-lg font-black text-white">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-xs text-blue-300 leading-relaxed">
                   <span className="font-bold uppercase">Conseil :</span> 
                   {data.find(d => d.label.includes('Post-Sign'))?.value! > 0 
                     ? "Le taux de rétractation est critique. Vérifiez le discours commercial post-signature."
                     : "La majorité des pertes survient avant lecture. Améliorez l'objet des emails."
                   }
                </p>
            </div>
        </div>

    </div>
  );
}
