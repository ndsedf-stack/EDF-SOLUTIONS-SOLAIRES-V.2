import { BrainEntity } from "../types";
import { BrainSignal } from "./types";
import { Study } from "@/brain/types";

/**
 * @file signals/financial.ts
 * @description Extracts financial signals (Cash at Risk, Late Deposits)
 * @layer 1 - Signals
 */

import { SIGNALS_CATALOG } from "./signalsRegistry";

export function detectFinancialSignals(study: Study): BrainSignal[] {
  const signals: BrainSignal[] = [];
  const now = new Date().toISOString();

  // 1. ACOMPTE REQUIS MAIS NON PAYÉ
  if (study.has_deposit && !study.deposit_paid) {
      const def = SIGNALS_CATALOG.FINANCIAL_DEPOSIT_PENDING;
      signals.push({
          id: `SIG-FIN-DEP-${study.id}`,
          code: def.code,
          domain: def.domain,
          severity: def.defaultSeverity,
          confidence: 1.0,
          label: def.label,
          description: `Acompte de ${study.deposit_amount}€ attendu.`,
          detectedAt: now,
          source: "rules_engine",
          metadata: { amount: study.deposit_amount }
      });
  }

  // 2. RETARD ACOMPTE (> 10 jours)
  if (study.isDepositLate) { 
      const def = SIGNALS_CATALOG.FINANCIAL_DEPOSIT_LATE;
      signals.push({
          id: `SIG-FIN-LATE-${study.id}`,
          code: def.code,
          domain: def.domain,
          severity: def.defaultSeverity,
          confidence: 1.0,
          label: def.label,
          description: "Délai de paiement acompte dépassé (>10j).",
          detectedAt: now,
          source: "rules_engine",
          metadata: { daysLate: study.daysLate }
      });
  }

  return signals;
}
