import { CVIOutput } from "../engines/cviEngine";
import { BrainSignal } from "../signals/types";
import { PrescribedAction } from "./types";
import { PROTOCOL_LIBRARY } from "./protocolLibrary";
import { BusinessProtocol, UrgencyLevel } from "./protocolTypes";

/**
 * @file decision/DecisionEngine.ts
 * @description The "Commercial Reflex" Engine.
 * 
 * ROLE: 
 * - Analyze the CVI Score, Status, and Behavioral Signals.
 * - Map these metrics to the protocolLibrary.
 * - Select 1 Primary Protocol + N Secondary Protocols.
 */

export const DecisionEngine = {
    decide(
        entityId: string, 
        cvi: CVIOutput, 
        signals: BrainSignal[],
        crmStatus: string
    ): PrescribedAction | undefined {
        
        // --- 1. SELECTION DES CANDIDATS ---
        const candidates: BusinessProtocol[] = Object.values(PROTOCOL_LIBRARY).filter(protocol => {
            // Check CRM Status compatibility (e.g., protocol for "signed" clients vs "leads")
            const statusMatch = !protocol.triggers.crmStatus || 
                               protocol.triggers.crmStatus.includes(crmStatus);
            
            // Check Signal Requirements (Must have at least one of the required signals)
            const signalMatch = protocol.triggers.requiredSignals.some(reqCode => 
                signals.some(sig => sig.code === reqCode)
            );

            // Check Score Requirements
            const scoreMatch = !protocol.triggers.minCviScore || 
                              cvi.cviScore >= protocol.triggers.minCviScore;

            return statusMatch && (signalMatch || scoreMatch);
        });

        if (candidates.length === 0) return undefined;

        // --- 2. TRI PAR PRIORITÉ (URGENCY) ---
        const urgencyOrder: Record<UrgencyLevel, number> = { "CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1 };
        const sortedCandidates = candidates.sort((a, b) => 
            urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
        );

        // --- 3. SÉLECTION (PRIMAIRE + SECONDAIRES) ---
        const primaryProtocol = sortedCandidates[0];
        const secondaryProtocols = sortedCandidates.slice(1, 3); // Max 2 extra for UI density

        // --- 4. CONSTRUCTION DE L'ACTION PRESCRITE ---
        return {
            id: `ACT-${entityId}-${Date.now()}`,
            type: "protocol_execution",
            priority: primaryProtocol.urgency,
            reason: `Dossier #${entityId.slice(0,6)}: Risque élevé détecté via CVI (${cvi.cviScore}). Domaines d'impact: ${cvi.dominantDrivers.join(', ')}.`,
            primaryProtocol,
            secondaryProtocols,
            payload: {
                entityId,
                stake: cvi.projection?.predictedLoss || "Enjeu non quantifié",
                executiveSummary: cvi.executiveSummary
            },
            generatedAt: new Date().toISOString(),
            deadline: primaryProtocol.urgency === "CRITICAL" ? "Immédiat" : "24h"
        };
    }
};
