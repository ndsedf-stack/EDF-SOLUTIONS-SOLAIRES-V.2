import { BrainEntity } from "../types";
import { EngineResult } from "../engines/types";
import { CVIOutput } from "../engines/cviEngine";
import { BrainSignal } from "../signals/types";
import { PrescribedAction } from "../decision/types";

/**
 * @file synthesis/types.ts
 * @description Architecture for the Synthesis Layer
 * @layer 3 - Synthesis
 */

export interface UnifiedState {
  entity: BrainEntity;
  globalScore: number; 
  dominantState: string;
  contributingFactors: {
    engineId: string;
    weight: number;
    impact: number;
  }[];
  verdict: "safe" | "watch" | "danger" | "critical";
}

export interface Synthesizer {
  merge(results: EngineResult[]): UnifiedState;
}

/**
 * Global snapshot of the entire system at a point in time.
 * Orchestrates Signals -> CVI -> Tension -> Decisions.
 */
export interface SystemSnapshot {
  timestamp: string;
  
  metrics: {
    totalEntities: number;
    globalTension: number; // 0-100
    systemState: "STABLE" | "VOLATILE" | "CRITICAL" | "MELTDOWN";
    cashAtRisk: number;
  };

  // Detailed analysis per entity
  analysis: {
    entityId: string;
    signals: BrainSignal[];
    cvi: CVIOutput;
    action?: PrescribedAction;
    study?: any; // <--- ADDED: Carrying the study name/details
  }[];

  // Strategic buckets
  buckets: {
    warRoom: string[]; // IDs of entities in War Room
    watchList: string[]; // IDs to watch
    topPriorities: string[]; // Ordered list of IDs
  };
}
