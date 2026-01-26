import React from 'react';
import { SystemSnapshot } from '@/lib/brain/synthesis/types';
import { 
    ExecutiveHeader, 
    ExposureSnapshot, 
    ActiveSignals 
} from './WarRoomComponents';
import { CVIAnalysis, SystemReasoning, ExecutiveAction, LeversBar } from './WarRoomComponentsPart2';

interface WarRoomProps {
    snapshot: SystemSnapshot;
}

export const WarRoom: React.FC<WarRoomProps> = ({ snapshot }) => {
    // Select the TOP PRIORITY to display in detail (Executive View)
    // In a real app, this could be stateful to select different entities
    const topPriorityId = snapshot.buckets.topPriorities[0];
    const topPriorityAnalysis = snapshot.analysis.find(a => a.entityId === topPriorityId);

    if (!topPriorityAnalysis) {
        return (
            <div className="rounded-none border border-zinc-900 bg-zinc-950 min-h-[400px] flex items-center justify-center text-zinc-600 font-mono text-xs tracking-widest uppercase">
                Système Stable / Aucun Risque Actif
            </div>
        );
    }

// USES: Surface Principal (zinc-950), Border Subtle (zinc-900), Glass Panel (Charter)
    return (
        <div className="rounded-sm overflow-hidden flex flex-col h-full border border-zinc-900 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] bg-zinc-950">
            {/* GLOBAL SYSTEM VIEW */}
            <ExecutiveHeader snapshot={snapshot} />
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                
                {/* 1. TOP DENSITY BAR (Exposure + System Context) */}
                <div className="border-b border-zinc-900">
                    <ExposureSnapshot snapshot={snapshot} />
                </div>

                {/* 2. SECONDARY THREATS (Watchlist) - NOW HORIZONTAL & COMPACT */}
                <div className="px-8 py-4 border-b border-zinc-900 bg-zinc-900/10">
                    <h3 className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <div className="w-1 h-1 bg-zinc-600 rounded-full" />
                        Surveillance Système (Menaces Secondaires)
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                        {snapshot.analysis
                            .filter(a => snapshot.buckets.watchList.includes(a.entityId))
                            .length > 0 ? (
                            snapshot.analysis
                                .filter(a => snapshot.buckets.watchList.includes(a.entityId))
                                .slice(0, 6)
                                .map(a => (
                                    <div key={a.entityId} className="flex-none min-w-[200px] bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-sm hover:bg-zinc-900/60 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs text-zinc-400 font-bold truncate max-w-[140px]">{a.study?.name || "Entité Inconnue"}</span>
                                            <span className="text-[10px] text-zinc-600 font-mono">{a.cvi.cviScore}</span>
                                        </div>
                                        <div className="w-full h-0.5 bg-zinc-800">
                                            <div className="h-full bg-zinc-600" style={{ width: `${a.cvi.cviScore}%` }} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-[10px] text-zinc-700 font-mono uppercase tracking-[0.2em] italic py-1">
                                    Aucune menace secondaire active. Spectre sécurisé.
                                </div>
                            )
                        }
                    </div>
                </div>

                {/* 3. PRIMARY CASE (COMMAND & CONTROL FOCUS) */}
                <div className="flex-1 bg-zinc-950 flex flex-col">
                    <div className="px-8 py-4 bg-zinc-900/10 border-b border-zinc-900 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                             <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                             <h3 className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">
                                 Unit_Focus: <span className="text-zinc-200 ml-2 font-bold">{topPriorityAnalysis.study?.name || "Entité Inconnue"}</span>
                             </h3>
                        </div>
                        <div className="flex items-center gap-8">
                            <span className="text-[10px] font-mono text-zinc-700 tracking-[0.3em]">REF_{topPriorityId.split('-')[0]}</span>
                        </div>
                    </div>

                    {/* COMMAND CENTER (PRIMARY ACTION & PROTOCOL) */}
                    <ExecutiveAction action={topPriorityAnalysis.action} />

                    {/* OPERATIONAL LEVERS (SECONDARY PROTOCOLS) */}
                    <LeversBar action={topPriorityAnalysis.action} />

                    {/* SUPPORTING INTELLIGENCE */}
                    <div className="grid grid-cols-12 divide-x divide-zinc-900">
                        <div className="col-span-12 lg:col-span-7">
                            <ActiveSignals signals={topPriorityAnalysis.signals} />
                            <SystemReasoning reasoning={topPriorityAnalysis.cvi.reasoning} />
                        </div>
                        <div className="col-span-12 lg:col-span-5 bg-zinc-900/5">
                            <CVIAnalysis cvi={topPriorityAnalysis.cvi} />
                        </div>
                    </div>
                </div>

                {/* 4. SYSTEM TELEMETRY (FIXED BOTTOM) */}
                <div className="p-8 border-t border-zinc-900 bg-zinc-950/90 sticky bottom-0">
                    <div className="flex justify-between items-center text-[11px] text-zinc-600 font-mono uppercase tracking-[0.2em]">
                        <div className="flex gap-10">
                            <span>SENSORS: ACTIVE</span>
                            <span>CORE_ENG: V1.1.2</span>
                            <span>LATENCE: 4ms</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>CONFIANCE SYSTÈME :</span>
                            <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600" style={{ width: `${topPriorityAnalysis.cvi.systemConfidence * 100}%` }} />
                            </div>
                            <span className="text-zinc-300 font-bold">{(topPriorityAnalysis.cvi.systemConfidence * 100).toFixed(0)}%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
