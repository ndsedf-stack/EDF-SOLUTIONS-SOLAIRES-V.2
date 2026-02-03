import React from 'react';
import { SystemSnapshot } from '@/lib/brain/synthesis/types';
import { ActiveSignals } from './WarRoomComponents';

// ==========================================
// 4. SYSTEM REASONING
// 4. CVI ANALYSIS (METRICS & VISUALS)
// ==========================================
// USES: Surface Active (zinc-800 for bars), Text defined by Charter
export const CVIAnalysis: React.FC<{ cvi: any }> = ({ cvi }) => {
    return (
        <div className="p-8">
            <h4 className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-8">Diagnostic Algorithmique (CVI)</h4>
            <div className="grid grid-cols-2 gap-10">
                 <div className="col-span-1">
                    <div className="flex justify-between items-baseline mb-3">
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Score de Volatilité</span>
                        <span className={`text-4xl font-black tracking-tighter tabular-nums ${
                            cvi.cviScore > 50 ? 'text-red-500' : 'text-emerald-500'
                        }`}>{cvi.cviScore} <span className="text-zinc-700 text-sm font-bold">/100</span></span>
                    </div>
                    {/* Progress Bar: Zinc-800 track, Semantic fill - Ultra Thin */}
                    <div className="h-1 bg-zinc-900 w-full rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${cvi.cviScore > 50 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${cvi.cviScore}%` }}
                        />
                    </div>
                </div>

                <div className="col-span-1">
                    <span className="text-[11px] text-zinc-500 block mb-3 font-bold uppercase tracking-[0.15em]">Facteurs Dominants</span>
                     <div className="flex flex-wrap gap-2">
                        {cvi.dominantDrivers.map((d: any) => (
                            <span key={d} className="text-xs text-zinc-200 font-mono tracking-tight bg-zinc-900 px-3 py-1 border border-zinc-800 rounded">
                                {d}
                            </span>
                        ))}
                     </div>
                </div>

                <div className="col-span-2 mt-6 pt-8 border-t border-zinc-900">
                    <span className="text-[11px] text-zinc-600 block mb-5 font-bold uppercase tracking-[0.15em]">Modélisation de Scénario Prédictif</span>
                     <div className="flex items-stretch justify-between bg-zinc-900/40 p-6 border border-zinc-900 rounded">
                         {/* TIME WINDOW */}
                         <div className="pr-10 border-r border-zinc-800">
                             <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Fenêtre de Résolution</div>
                             <div className="text-3xl text-zinc-100 font-mono leading-none tracking-tighter">
                                 {cvi.projection?.timeWindow || "INDÉFINIE"}
                             </div>
                         </div>
                         
                         {/* SCENARIO */}
                         <div className="px-10 flex-1">
                             <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Scénario Prévisionnel</div>
                             <div className={`text-sm font-bold font-mono tracking-tight uppercase leading-relaxed ${
                                   cvi.projection?.trend === 'DETERIORATING' ? 'text-red-400' : 'text-zinc-300'
                             }`}>
                                 {cvi.projection?.scenario || "OPÉRATIONS STABLES"}
                             </div>
                         </div>

                         {/* STAKE */}
                         <div className="pl-10 border-l border-zinc-800 text-right">
                             <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Exposition au Passif</div>
                             <div className="text-xl text-zinc-400 font-mono tabular-nums">
                                 {cvi.projection?.predictedLoss || "---"}
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 4B. SYSTEM REASONING (TEXTUAL LOGIC)
// ==========================================
export const SystemReasoning: React.FC<{ reasoning?: string[] }> = ({ reasoning }) => {
    if (!reasoning || !reasoning.length) return null;
    
    return (
         <div className="px-6 pb-6">
            <h4 className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-2">Journal de Raisonnement du Moteur</h4>
            <div className="bg-zinc-900/50 p-3 border border-zinc-900/50 rounded-sm space-y-1">
                {reasoning.slice(0, 3).map((log, i) => (
                    <div key={i} className="text-[9px] font-mono text-zinc-500 flex gap-2">
                        <span className="text-zinc-700">L{i+1}</span>
                        <span>{log}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ==========================================
// 5. EXECUTIVE ACTION (RENAMED: SYSTEM RECOMMENDATION)
// ==========================================
// USES: Primary Action (Blue-600), Surface (Zinc-950)
// ==========================================
// 5. COMMAND CENTER (EXECUTIVE ACTION V2)
// ==========================================
// USES: Primary Action (Blue-600), Surface (Zinc-950), High Density Text
export const ExecutiveAction: React.FC<{ action?: any }> = ({ action }) => {
    const [status, setStatus] = React.useState<'IDLE' | 'EXECUTING' | 'DONE'>('IDLE');
    const [logs, setLogs] = React.useState<string[]>([]);

    if (!action) return null;

    const p = action.primaryProtocol || action.protocol; // Handle both old and new action structures
    if (!p) return null;

    const handleExecute = () => {
        setStatus('EXECUTING');
        setLogs(["Liaison Cryptographique...", "Autorisation Niveau 7..."]);
        
        setTimeout(() => {
            setLogs(prev => [...prev, "Transmission Séquence: " + p.id, "Gateway Response: ACK"]);
        }, 800);

        setTimeout(() => {
            setLogs(prev => [...prev, "Opération terminée avec succès.", "KPI de référence: " + (p.successKPI || p.successMetrics?.kpiName)]);
            setStatus('DONE');
        }, 1600);
    };

    const nextAction = p.steps.find((s: any) => s.order === 1)?.label || p.steps[0]?.action;

    return (
        <div className="bg-zinc-950 border-y border-zinc-900 overflow-hidden">
            {/* HERO SECTION: PROTOCOL & OBJECTIVE */}
            <div className={`px-10 py-12 flex justify-between items-start border-b border-zinc-900/50 ${
                status === 'DONE' ? 'bg-emerald-950/10' : 'bg-blue-950/5'
            }`}>
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                         <div className={`px-3 py-1 text-[11px] font-black tracking-[0.2em] border ${
                             status === 'DONE' ? 'text-emerald-500 border-emerald-500/50 bg-emerald-500/10' : 'text-blue-500 border-blue-500/50 bg-blue-500/10'
                         }`}>
                             {status === 'DONE' ? 'OFFICIEL : EXÉCUTÉ' : p.name}
                         </div>
                         <div className="h-px flex-1 bg-zinc-900" />
                    </div>
                    
                    <div className="mb-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] block mb-1">🎯 Objectif Business</span>
                        <h2 className="text-4xl text-white font-black tracking-tighter leading-none mb-6">
                            {status === 'DONE' ? 'Résultats en attente' : p.objective}
                        </h2>
                    </div>

                    <div className="flex items-center gap-10">
                         <div className="border-l-2 border-zinc-800 pl-6">
                             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] block mb-1">⚠️ Risque de Perte</span>
                             <span className="text-sm text-zinc-300 font-mono tracking-tight uppercase leading-relaxed font-bold">{p.riskOfFailure}</span>
                         </div>
                         <div className="border-l-2 border-zinc-800 pl-6">
                             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] block mb-1">📊 Ce que tu dois surveiller (KPI)</span>
                             <span className="text-sm text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded">
                                 {p.successMetrics?.kpiName || "Indicateur Clé"}
                             </span>
                         </div>
                    </div>
                </div>

                {/* TIMER SECTION */}
                <div className="text-right pl-20">
                     <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-[0.3em] block mb-2">⏱️ Fenêtre Critique</span>
                     <div className={`text-6xl font-black leading-none tracking-tighter tabular-nums ${
                         status === 'DONE' ? 'text-emerald-500' : 'text-red-500'
                     }`}>
                         {status === 'DONE' ? '--:--' : p.criticalWindow || "48:00"}
                     </div>
                     <div className="bg-zinc-900 px-3 py-1 mt-3 inline-block rounded-sm">
                         <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-widest font-bold">Cible : {p.successMetrics?.targetValue}</span>
                     </div>
                </div>
            </div>

            {/* ACTION CENTER */}
            <div className="px-10 py-10 grid grid-cols-12 gap-10 bg-zinc-900/10">
                <div className="col-span-7">
                    <span className="text-[11px] text-zinc-600 font-bold uppercase tracking-[0.2em] block mb-6">🛠️ Plan d'Action Proposé</span>
                    <div className="bg-zinc-950 p-8 border border-zinc-900 rounded-sm shadow-xl">
                         <div className="flex gap-6 items-center">
                              <div className="w-12 h-12 rounded-none border border-blue-500/30 flex items-center justify-center text-blue-500 text-xl font-mono">
                                  01
                              </div>
                              <div className="flex-1">
                                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mb-1 block">👉 Prochaine Action Concrète</span>
                                  <p className="text-xl text-white font-bold tracking-tight">
                                      {nextAction}
                                  </p>
                              </div>
                         </div>
                    </div>
                </div>

                <div className="col-span-5 flex flex-col justify-end">
                    {status === 'IDLE' && (
                        <button 
                            onClick={handleExecute}
                            className="w-full py-6 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-[13px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            <span>EXÉCUTER MAINTENANT</span>
                            <span>→</span>
                        </button>
                    )}
                    {status === 'EXECUTING' && (
                        <button disabled className="w-full py-6 bg-zinc-900 text-blue-400 text-[13px] font-black uppercase tracking-[0.3em] cursor-wait flex items-center justify-center gap-3">
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent animate-spin" />
                            <span>TRANSMISSION...</span>
                        </button>
                    )}
                    {status === 'DONE' && (
                        <div className="w-full py-6 bg-emerald-950/20 text-emerald-500 border border-emerald-500/30 font-black text-center tracking-[0.3em] text-[13px]">
                             SÉQUENCE VALIDÉE ✓
                        </div>
                    )}
                </div>
            </div>

            {/* LOGS (Visible post-execution) */}
            {(status === 'EXECUTING' || status === 'DONE') && (
                <div className="px-10 py-4 bg-black/80 font-mono text-[10px] text-zinc-500 space-y-1">
                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-4">
                            <span className="text-zinc-700">[{new Date().toLocaleTimeString()}]</span>
                            <span className="text-emerald-500/70">{log}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ==========================================
// 6. LEVERS BAR (SECONDARY PROTOCOLS)
// ==========================================
export const LeversBar: React.FC<{ action?: any }> = ({ action }) => {
    if (!action || !action.secondaryProtocols || action.secondaryProtocols.length === 0) return null;

    return (
        <div className="px-10 py-6 border-b border-zinc-900 bg-zinc-950">
             <div className="flex items-center gap-4 mb-4">
                 <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] whitespace-nowrap">Leviers Opérationnels Alternatifs</span>
                 <div className="h-px flex-1 bg-zinc-900" />
             </div>
             <div className="flex gap-4">
                 {action.secondaryProtocols.map((p: any) => (
                     <button key={p.id} className="flex-1 bg-zinc-900/50 border border-zinc-800 p-4 rounded-sm hover:border-blue-500/50 hover:bg-zinc-900 transition-all text-left group">
                         <div className="flex justify-between items-center mb-1">
                             <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{p.category}</span>
                             <span className={`text-[9px] font-mono ${
                                 p.urgency === 'CRITICAL' ? 'text-red-500' : 'text-zinc-400'
                             }`}>{p.urgency}</span>
                         </div>
                         <h4 className="text-sm text-zinc-300 font-bold group-hover:text-blue-400 transition-colors truncate">{p.name}</h4>
                         <p className="text-[10px] text-zinc-600 mt-1 line-clamp-1">{p.objective}</p>
                     </button>
                 ))}
             </div>
        </div>
    );
};

// ==========================================
// 7. TELEMETRY
// ==========================================
export const Telemetry: React.FC<{ timestamp: string, confidence: number }> = ({ timestamp, confidence }) => {
    return (
        <div className="px-6 py-2 border-t border-zinc-900 flex justify-between items-center bg-zinc-950">
             <span className="text-[10px] text-zinc-600 font-mono italic">UNIT: {timestamp.split('T')[1].replace('Z', '')}</span>
             <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Confiance Analytique : <span className="text-zinc-400">{(confidence * 100).toFixed(0)}%</span></span>
        </div>
    );
}
