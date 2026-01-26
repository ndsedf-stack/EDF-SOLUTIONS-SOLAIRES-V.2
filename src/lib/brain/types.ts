/**
 * @file types.ts
 * @description Core Atomic Types for the Brain Architecture (Layer 2)
 * @layer Core
 * 
 * This file defines the fundamental atoms of the system:
 * - Entity: The subject of analysis (Study, Client, Lead).
 * - Probability: A normalized score (0-1) representing certainty.
 * - Timestamp: Consistency for time tracking.
 * - ID: Typed identifiers for safety.
 */

export type EntityId = string;
export type SignalId = string;
export type EngineId = string;

export type Probability = number; // 0.0 to 1.0

/**
 * Represents the fundamental subject being analyzed.
 * The Brain doesn't care if it's a "Study" or "Lead", it sees an Entity.
 */
export interface BrainEntity {
  id: EntityId;
  type: "study" | "lead" | "client" | "system";
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

/**
 * Standardized Context passed through the pipeline.
 * Ensures every engine has access to the "Now" and "Global State".
 */
export interface BrainContext {
  now: string; // ISO Date
  mode: "standard" | "war_room" | "simulation";
  dryRun: boolean;
  logger?: (level: "info" | "warn" | "error", message: string) => void;
}
