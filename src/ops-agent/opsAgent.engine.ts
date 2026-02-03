// src/ops-agent/opsAgent.engine.ts

import { OpsSnapshotRow } from "../ops-engine/ops.types";
import { analyzeAxisA } from "./axes/axisA";
import { analyzeAxisB } from "./axes/axisB";
import { analyzeAxisC } from "./axes/axisC";

export type OpsPriority =
  | "WAR_ROOM"
  | "PRIORITY_ACTION"
  | "WATCH"
  | "STOP"
  | "NONE";

export interface OpsDecision {
  studyId: string;
  priority: OpsPriority;
  sourceAxis: "A" | "B" | "C" | null;
  reasons: string[];
  recommendation: string;
  audit_payload?: any; // Shadow Write Payload
}

/**
 * OPS AGENT — MOTEUR CENTRAL
 * Pure function. Aucun effet de bord.
 */
export function evaluateOpsAgent(row: OpsSnapshotRow): OpsDecision {
  // 1️⃣ AXE A — SIGNÉS (ANTI-ANNULATION)
  const axisA = analyzeAxisA(row);
  if (axisA) {
    if (axisA.status === "WAR_ROOM") {
      return {
        studyId: row.study_id,
        priority: "WAR_ROOM",
        sourceAxis: "A",
        reasons: axisA.reasons,
        recommendation: axisA.recommendation,
      };
    }

    if (axisA.status === "A_SECURISER") {
      return {
        studyId: row.study_id,
        priority: "PRIORITY_ACTION",
        sourceAxis: "A",
        reasons: axisA.reasons,
        recommendation: axisA.recommendation,
      };
    }
  }

  // 2️⃣ AXE B — POST-RDV / INERTIE
  const axisB = analyzeAxisB(row);
  if (axisB) {
    if (axisB.status === "A_RELANCER") {
      return {
        studyId: row.study_id,
        priority: "PRIORITY_ACTION",
        sourceAxis: "B",
        reasons: axisB.reasons,
        recommendation: axisB.recommendation,
      };
    }

    if (axisB.status === "A_SURVEILLER") {
      return {
        studyId: row.study_id,
        priority: "WATCH",
        sourceAxis: "B",
        reasons: axisB.reasons,
        recommendation: axisB.recommendation,
      };
    }
  }

  // 3️⃣ AXE C — LEADS
  const axisC = analyzeAxisC(row);
  if (axisC) {
    if (axisC.status === "A_APPELER") {
      return {
        studyId: row.study_id,
        priority: "PRIORITY_ACTION",
        sourceAxis: "C",
        reasons: axisC.reasons,
        recommendation: axisC.recommendation,
      };
    }

    if (axisC.status === "A_ABANDONNER") {
      return {
        studyId: row.study_id,
        priority: "STOP",
        sourceAxis: "C",
        reasons: axisC.reasons,
        recommendation: axisC.recommendation,
      };
    }
  }

  // 4️⃣ RAS
  const noneDecision: OpsDecision = {
    studyId: row.study_id,
    priority: "NONE",
    sourceAxis: null,
    reasons: ["Aucune action requise"],
    recommendation: "Aucune",
  };
  
  // 🔥 AUTO-CONSTRUCTION DE L'AUDIT (SHADOW WRITE)
  // Prêt pour la future persistance serveur
  noneDecision.audit_payload = {
    study_id: row.study_id,
    action_performed: "NONE",
    justification: "Situation normale, aucune action",
    source_axis: null,
    risk_score: 0, // Placeholder, ideally recompute or pass in
    health_score: 0, 
    created_at: new Date().toISOString()
  };
  
  return noneDecision;
}

// 🛡️ MODE AUDIT SERVEUR (SHADOW WRITE)
// Cette fonction ne DOIT PAS être appelée par le front (React).
// Elle est destinée au WORKER NodeJS.
export function createAuditLog(decision: OpsDecision, scores: { risk: number, health: number }) {
    return {
      study_id: decision.studyId,
      action_performed: decision.priority,
      justification: decision.reasons.join(', '),
      source_axis: decision.sourceAxis,
      risk_score: scores.risk,
      health_score: scores.health,
      created_at: new Date().toISOString()
    };
}
