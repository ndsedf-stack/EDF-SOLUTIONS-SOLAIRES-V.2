import React from 'react';
import { SystemSnapshot } from '@/lib/brain/synthesis/types';
import { BEHAVIORAL_LABELS } from '../Dashboard'; // Reusing for consistent styling
import { ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';

// ==========================================
// 1. EXECUTIVE HEADER (RENAMED: CONTRACT RISK CONTROL)
// ==========================================
// USES: Surface Principal (zinc-950), Text Inter (sans), Border Subtle (zinc-800/40)
// ACCENT: Financial Blue (blue-500) or Alert Crimson (red-500)
export const ExecutiveHeader: React.FC<{ snapshot: SystemSnapshot }> = ({ snapshot }) => {
  const { metrics, timestamp } = snapshot;
  const isCritical = metrics.systemState === 'CRITICAL' || metrics.systemState === 'MELTDOWN';

  const stateColor = isCritical ? 'text-red-500' : 'text-zinc-500';
  const tensionColor = isCritical ? 'text-red-500' : 'text-emerald-500';
  const stateLabel = metrics.systemState === 'MELTDOWN' ? 'ÉTAT CRITIQUE' : metrics.systemState;

  return (
    <div className={`px-8 py-6 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between`}>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-3 font-sans">
            <span className="text-zinc-100 uppercase tracking-widest border-l-4 border-blue-600 pl-3">CONTRÔLE DES RISQUES</span>
            <span className="text-zinc-700 text-xs mx-1">/</span>
            <span className={`text-xs font-black tracking-[0.2em] px-2 py-0.5 bg-zinc-900 rounded ${stateColor}`}>
                {stateLabel}
            </span>
        </h2>
        <p className="text-xs text-zinc-500 font-mono tracking-tight opacity-50">
           INSTANTANÉ SYSTÈME : {new Date(timestamp).toLocaleTimeString()}
        </p>
      </div>
      
      <div className="flex items-center gap-12">
         <div className="text-right border-r border-zinc-900 pr-8">
             <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.15em] mb-1">Portefeuille Géré</div>
             <div className="text-4xl font-black text-zinc-100 tracking-tighter tabular-nums underline decoration-blue-600/30 decoration-4 underline-offset-8">{metrics.totalEntities}</div>
         </div>
         <div className="text-right">
             <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.15em] mb-1">Volatilité Globale</div>
             <div className={`text-4xl font-black tracking-tighter tabular-nums ${tensionColor}`}>
                 {metrics.globalTension}%
             </div>
         </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. EXPOSURE SNAPSHOT
// ==========================================
// USES: Surface Card (zinc-900), Border Strong (zinc-700)
export const ExposureSnapshot: React.FC<{ snapshot: SystemSnapshot }> = ({ snapshot }) => {
    const { metrics } = snapshot;
    
    return (
        <div className="p-8 grid grid-cols-2 gap-8 border-b border-zinc-900 bg-zinc-950/20">
            <div className="pl-4 border-l-4 border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.2em]">Exposition Totale</span>
                </div>
                <div className="text-5xl font-black text-white tabular-nums tracking-tighter leading-none">
                    {metrics.cashAtRisk.toLocaleString()} <span className="text-2xl text-zinc-600 font-bold">€</span>
                </div>
            </div>
             <div className="pl-4 border-l-4 border-emerald-500/10">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.2em]">Actifs Sécurisés</span>
                </div>
                <div className="text-5xl font-light text-zinc-800 font-mono tabular-nums tracking-tighter leading-none">
                    --- <span className="text-2xl text-zinc-900">€</span>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 3. ACTIVE SIGNALS (For a specific entity or top priority)
// ==========================================
// ==========================================
// 3. ACTIVE SIGNALS
// ==========================================
// USES: Surface Card (zinc-900), Border Subtle (zinc-800)
export const ActiveSignals: React.FC<{ signals: any[] }> = ({ signals }) => {
    if (!signals || !signals.length) return <div className="text-zinc-600 italic text-xs p-8 border-b border-zinc-900">Aucun signal actif détecté.</div>;

    // Categorize
    const primary = signals.filter(s => s.strategy?.category === 'PRIMARY');
    const secondary = signals.filter(s => s.strategy?.category === 'SECONDARY');
    const contextual = signals.filter(s => !s.strategy?.category || s.strategy?.category === 'CONTEXTUAL');

    return (
        <div className="space-y-8 p-8 border-b border-zinc-900/50 bg-zinc-950/40">
            <div className="flex items-center justify-between mb-4">
                 <h4 className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Signaux de Risque Actifs</h4>
                 <span className="text-[11px] text-zinc-700 font-mono border border-zinc-800 px-2 py-0.5 rounded">{signals.length} DÉTECTÉS</span>
            </div>
            
            {/* PRIMARY RISK DRIVERS */}
            {primary.length > 0 && (
                <div className="space-y-4">
                     <span className="text-[10px] text-red-500 font-black uppercase tracking-[0.2em] block border-b border-red-500/20 pb-2">Facteurs de Risque Principaux</span>
                     {primary.map(sig => (
                         <div key={sig.id} className="bg-red-500/5 border-l-2 border-red-500/40 p-5 flex gap-6 hover:bg-red-500/[0.08] transition-colors">
                             <div className="text-center w-16 pt-0.5 border-r border-red-500/10 pr-6">
                                 <div className="text-[10px] text-red-500/60 font-black tracking-tighter mb-1">IMPACT</div>
                                 <div className="text-2xl font-light text-red-500 font-mono">+{sig.strategy?.impact}</div>
                             </div>
                             <div className="flex-1">
                                 <div className="text-xs text-red-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                     {sig.domain}
                                 </div>
                                 <div className="text-base text-zinc-100 font-semibold mb-1">{sig.label}</div>
                                 <div className="text-sm text-zinc-400 leading-relaxed max-w-2xl">{sig.description}</div>
                                 <div className="flex gap-4 mt-3 pt-3 border-t border-red-500/5 text-[10px] font-mono text-red-500/40 uppercase tracking-widest">
                                     <span>Sévérité: {(sig.severity*100).toFixed(0)}%</span>
                                     <span>Confiance: {(sig.confidence*100).toFixed(0)}%</span>
                                 </div>
                             </div>
                         </div>
                     ))}
                </div>
            )}

            {/* SECONDARY CONTRIBUTORS */}
            {secondary.length > 0 && (
                <div className="space-y-3">
                     <span className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] block border-b border-amber-500/20 pb-2">Contributeurs Secondaires</span>
                     {secondary.map(sig => (
                         <div key={sig.id} className="bg-amber-500/[0.03] border-l-2 border-amber-500/20 p-4 flex gap-4 items-center hover:bg-amber-500/[0.06] transition-colors">
                              <div className="w-12 text-center pr-3 border-r border-amber-500/10">
                                  <span className="text-xl font-mono text-amber-500/60 font-light">+{sig.strategy?.impact}</span>
                              </div>
                              <div className="flex-1">
                                   <div className="flex justify-between items-center mb-1">
                                      <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-widest">{sig.domain}</span>
                                      <span className="text-[10px] text-zinc-600 font-mono">{sig.code.split('.').pop()}</span>
                                   </div>
                                   <div className="text-sm text-zinc-200 font-medium">{sig.label}</div>
                              </div>
                         </div>
                     ))}
                </div>
            )}

            {/* CONTEXTUAL SIGNALS */}
            {contextual.length > 0 && (
                <div className="space-y-2">
                     <span className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.15em] block border-b border-zinc-800/50 pb-2">Contexte & Historique</span>
                     {contextual.map(sig => (
                         <div key={sig.id} className="flex justify-between py-2 px-4 hover:bg-zinc-900/50 border border-transparent hover:border-zinc-800 transition-colors rounded">
                              <span className="text-xs text-zinc-500 font-mono">{sig.label}</span>
                              <span className="text-xs text-zinc-700 font-mono">+{sig.strategy?.impact || 0} PTS</span>
                         </div>
                     ))}
                </div>
            )}
        </div>
    );
}
