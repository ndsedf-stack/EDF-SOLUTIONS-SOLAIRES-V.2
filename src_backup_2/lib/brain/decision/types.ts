import { CVIOutput } from "../engines/cviEngine";
import { BrainSignal } from "../signals/types";
import { BusinessProtocol, UrgencyLevel } from "./protocolTypes";

/**
 * @file decision/types.ts
 * @description Architecture for the Decision Layer
 */

export type ActionType = "notify_human" | "send_email" | "update_record" | "wait" | "protocol_execution";

export interface PrescribedAction {
  id: string;
  type: ActionType;
  priority: UrgencyLevel;
  reason: string; 
  
  // THE CORE SELECTION
  primaryProtocol: BusinessProtocol;
  secondaryProtocols: BusinessProtocol[]; 
  
  payload: Record<string, unknown>; 
  deadline?: string;
  generatedAt: string;
}

export interface DecisionEngine {
  decide(
    entityId: string, 
    cvi: CVIOutput, 
    signals: BrainSignal[],
    crmStatus: string
  ): PrescribedAction | undefined;
}
