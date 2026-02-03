import { Study } from "@/brain/types";
import { BrainContext } from "../types";
import { SystemSnapshot } from "./types";
import { CVIEngine } from "../engines/cviEngine";
import { detectFinancialSignals } from "../signals/financial"; 
import { BrainSignal } from "../signals/types";
import { DecisionEngine } from "../decision/decisionEngine";
import { MemoryEngine } from "../memory/memory";

// ==========================================
// ORCHESTRATOR: SYSTEM SNAPSHOT
// ==========================================

export function takeSystemSnapshot(studies: Study[], context: BrainContext): SystemSnapshot {
  const now = new Date().toISOString();
  
  // 1. RAW ANALYSIS (Parallel Processing)
  const analysisResults = studies.map(study => {
    // A. Signals & CVI (Engine Execution)
    const engineResult = CVIEngine.process({
      entity: { ...study, type: 'study' } as any, 
      signals: [], 
      context
    });

    const cvi = engineResult.output as import("../engines/cviEngine").CVIOutput;
    const signals = cvi.activeSignals || []; 

    return {
      entityId: study.id,
      study,
      cvi,
      signals 
    };
  });

  // 2. SYSTEM WIDE METRICS
  const criticalItems = analysisResults.filter(r => r.cvi.status === 'CRITICAL' || r.cvi.status === 'LOST');
  const cashAtRisk = criticalItems.reduce((sum, item) => sum + (item.study.total_price || 0), 0);

  const avgCvi = analysisResults.reduce((sum, r) => sum + r.cvi.cviScore, 0) / (analysisResults.length || 1);
  const volumePenalty = (criticalItems.length * 2); 
  const globalTension = Math.min(100, Math.round(avgCvi + volumePenalty));

  let systemState: SystemSnapshot['metrics']['systemState'] = "STABLE";
  if (globalTension > 80) systemState = "MELTDOWN";
  else if (globalTension > 50) systemState = "CRITICAL";
  else if (globalTension > 30) systemState = "VOLATILE";

  // 3. STRATEGIC BUCKETING
  const warRoom = criticalItems.map(r => r.entityId);

  const topPriorities = analysisResults
    .sort((a, b) => b.cvi.cviScore - a.cvi.cviScore)
    .slice(0, 5)
    .map(r => r.entityId);
    
  const watchList = analysisResults
    .filter(r => r.cvi.status === 'VOLATILE')
    .map(r => r.entityId);

  // 4. DECISION MAPPING
  const finalAnalysis = analysisResults.map(r => {
    // Direct call to imported Engine
    const action = DecisionEngine.decide(
        r.entityId,
        r.cvi,
        r.signals || [],
        r.study.status || 'unknown'
    );

    return {
        entityId: r.entityId,
        study: r.study, // <--- RECOVERED: Carrying the name for the UI
        cvi: r.cvi,
        signals: r.signals,
        action
    };
  });

  const snapshot: SystemSnapshot = {
    timestamp: now,
    metrics: {
      totalEntities: studies.length,
      globalTension,
      systemState,
      cashAtRisk
    },
    analysis: finalAnalysis,
    buckets: {
      warRoom,
      watchList,
      topPriorities
    }
  };

  // 5. MEMORY LOGGING
  try {
      MemoryEngine.logSnapshot(snapshot);
  } catch (e) {
      console.warn("Memory logging failed", e);
  }

  return snapshot;
}
