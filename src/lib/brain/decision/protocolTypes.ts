export type ProtocolCategory = 
    | "ACQUISITION" 
    | "CONVERSION" 
    | "SÉCURISATION" 
    | "RÉCUPÉRATION" 
    | "FIDÉLISATION";

export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ActionOwner = "SYSTEM" | "HUMAN";

export interface ProtocolStep {
    order: number;
    label: string;
    owner: ActionOwner;
    actionType: "EMAIL" | "SMS" | "CALL" | "TASK" | "SYSTEM_BLOCK" | "OFFER_GEN";
    description?: string;
}

export interface BranchingCondition {
    onEvent: "CLICK" | "OPEN" | "PAYMENT" | "SIGNATURE" | "NO_RESPONSE";
    afterDelay: string; // e.g., "24h", "2h"
    nextActionId?: string;
    escalateToUrgency?: UrgencyLevel;
}

export interface BusinessProtocol {
    id: string;
    name: string;
    objective: string;
    category: ProtocolCategory;
    urgency: UrgencyLevel;
    triggers: {
        crmStatus?: string[];
        minCviScore?: number;
        requiredSignals: string[];
    };
    steps: ProtocolStep[];
    conditions?: BranchingCondition[];
    successMetrics: {
        kpiName: string;
        targetValue: string;
        timeframe: string;
    };
    riskOfFailure: string;
}
