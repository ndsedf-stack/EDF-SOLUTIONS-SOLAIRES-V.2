import { BrainEntity } from "../types";
import { BrainSignal } from "./types";
import { Study } from "@/brain/types";

/**
 * @file signals/contract.ts
 * @description Extracts contract signals (War Room eligibility)
 * @layer 1 - Signals
 */

import { SIGNALS_CATALOG } from "./signalsRegistry";

export function detectContractSignals(study: Study): BrainSignal[] {
  const signals: BrainSignal[] = [];
  const now = new Date().toISOString();

 // WAR ROOM LOGIC REPLICATION
 // isInWarRoom = signed + has_deposit + !deposit_paid + signed_at <= 14 days
 // Here we emit signals that contribute to that state.
 
 if (study.status === 'signed') {
     const def = SIGNALS_CATALOG.CONTRACT_SIGNED;
     signals.push({
          id: `SIG-CTR-SIGNED-${study.id}`,
          code: def.code,
          domain: def.domain,
          severity: def.defaultSeverity,
          confidence: 1.0,
          label: def.label,
          description: "Le client a signé le contrat.",
          detectedAt: now,
          source: "crm"
      });
 }

 // WAR ROOM RISK
 // Note: We don't decide "Is in War Room" here (that's Intelligence/Engine).
 // We just signal the raw facts or specific combinations if they are atomic.
 // "Recent Signature without Deposit" is a signal.
 
 if (study.status === 'signed' && study.has_deposit && !study.deposit_paid) {
    //  Recalculating days to be safe on "Recent"
    //  Assuming WAR_ROOM_DAYS = 14 from config
    const daysSince = study.daysSinceSigned || 0;
    
    if (daysSince <= 14) {
        const def = SIGNALS_CATALOG.CONTRACT_WARROOM_CANDIDATE;
        signals.push({
            id: `SIG-CTR-WARROOM-${study.id}`,
            code: def.code,
            domain: def.domain,
            severity: def.defaultSeverity,
            confidence: 0.95,
            label: def.label,
            description: "Signature récente (<14j) sans acompte.",
            detectedAt: now,
            source: "rules_engine",
            metadata: { daysSince }
        });
    }

     // EXPIRING LEGAL WINDOW (S4 Trigger)
     if (daysSince >= 12 && daysSince <= 14 && !study.deposit_paid) {
        const def = SIGNALS_CATALOG.CONTRACT_RISK_EXPIRING_LEGAL;
        signals.push({
            id: `SIG-CTR-LEGAL-${study.id}`,
            code: def.code,
            domain: def.domain,
            severity: def.defaultSeverity,
            confidence: 0.98,
            label: def.label,
            description: "Fenêtre légale de sécurisation arrive à échéance.",
            detectedAt: now,
            source: "rules_engine",
            metadata: { daysSince }
        });
     }
  }

  return signals;
}
