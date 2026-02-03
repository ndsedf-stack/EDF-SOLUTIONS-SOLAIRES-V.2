import { PrescribedAction } from "../decision/types";
import { UnifiedState } from "../synthesis/types";

/**
 * @file memory/types.ts
 * @description Architecture for the Memory Layer
 * @layer 5 - Memory
 * 
 * ROLE:
 * - Stores the entire chain of thought (Input -> Signal -> Engine -> Synthesis -> Decision).
 * - Allows "Time Travel" debugging.
 * - Enables Reinforcement Learning (Did the decision work?).
 */

export interface ThoughtProcess {
  id: string; // UUID
  timestamp: string;
  entityId: string;
  
  // The Chain
  inputs: unknown[];
  synthesis: UnifiedState;
  decisions: PrescribedAction[];
  
  // Learning
  outcome?: "success" | "failure" | "ignored";
  feedback?: string;
}

export interface MemoryStore {
  save(thought: ThoughtProcess): Promise<void>;
  recall(entityId: string, limit: number): Promise<ThoughtProcess[]>;
  search(criteria: Record<string, unknown>): Promise<ThoughtProcess[]>;
}
