import { BrainEntity, BrainContext, Probability } from "../types";
import { Signal } from "../signals/types";

/**
 * @file engines/types.ts
 * @description Architecture for the Analysis Layer
 * @layer 2 - Engines
 * 
 * ROLE:
 * - Pure functions that take Signals + Entity as input.
 * - Return specific "Insights" or "Scores".
 * - Stateless and idempotent where possible.
 */

export interface StartParams {
  entity: BrainEntity;
  signals: Signal[];
  context: BrainContext;
}

export interface EngineResult<T = unknown> {
  engineId: string;
  score: number; // Normalized 0-100 score
  confidence: Probability;
  output: T; // Rich data (e.g., "Customer is agitated")
  reasoning: string[]; // Explainability trace
}

/**
 * Standard Interface for ALL Engines (CVI, Behavior, Finance...).
 * Ensures plug-and-play architecture.
 */
export interface IntelligenceEngine {
  id: string;
  name: string;
  version: string;
  
  /**
   * The core processing function.
   */
  process(params: StartParams): EngineResult;
}
