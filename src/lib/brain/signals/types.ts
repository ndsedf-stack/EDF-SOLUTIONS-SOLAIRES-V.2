import { SignalId, Probability } from "../types";

/**
 * @file signals/types.ts
 * @description Architecture for the Perception Layer (Signals)
 * @layer 1 - Signals
 */

export type BrainSignalDomain = 
  | "FINANCIAL"   // Money, Deposits, Costs
  | "ENGAGEMENT"  // Clicks, Views, Opens
  | "CONTRACT"    // Signature status, clauses
  | "HISTORICAL"  // Past interactions, previous studies
  | "SYSTEMIC";   // Global system state, market conditions

/**
 * OFFICIAL BRAIN SIGNAL MODEL
 * Represents a normalized atomic fact detected by the system.
 */
export interface BrainSignal {
  id: string; // Unique Signal ID
  
  /**
   * NAMING CONVENTION: DOMAIN.ENTITY.EVENT
   * Examples:
   * - FINANCIAL.DEPOSIT.PAID
   * - ENGAGEMENT.EMAIL.OPENED
   */
  code: string;
  
  domain: BrainSignalDomain;
  
  /**
   * Normalized impact score (0 to 1).
   * 0 = Neutral / Informational
   * 1 = Critical / Game Changer
   */
  severity: number;
  
  /**
   * Certainty of the detection (0 to 1).
   * 1.0 = Fact (Database record)
   * <1.0 = Inference (AI prediction, Heuristic)
   */
  confidence: number;
  
  label: string;      // Human readable short name (ex: "Client Muet")
  description: string; // Detailed context (ex: "Aucune interaction depuis 7j")
  
  detectedAt: string; // ISO Date
  source: string;     // e.g., "rules_engine", "behavior_engine"
  
  metadata?: Record<string, unknown>;
}

/**
 * Registry interface for signal definitions
 */
export interface SignalRegistry {
  register(signalDef: Partial<BrainSignal>): void;
  validate(signal: BrainSignal): boolean;
}
