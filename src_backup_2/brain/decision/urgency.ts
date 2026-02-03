import { SystemState } from "../types";

// =========================
// MODE URGENCE
// =========================
export function computeUrgencyMode(params: {
  tensionLevel: number;
  systemState: SystemState;
  priorityActions: any[];
}) {
  const { tensionLevel, systemState, priorityActions } = params;

  if (systemState === "critical") {
    return {
      active: true,
      level: "critical",
      message: "🚨 SYSTÈME SOUS PRESSION CRITIQUE",
      focus: priorityActions[0] || null,
    };
  }

  if (tensionLevel > 70) {
    return {
      active: true,
      level: "high",
      message: "⚠️ Forte tension détectée",
      focus: priorityActions[0] || null,
    };
  }

  if (tensionLevel > 40) {
    return {
      active: true,
      level: "medium",
      message: "⚡ Système sous tension",
      focus: priorityActions[0] || null,
    };
  }

  return {
    active: false,
    level: "normal",
    message: "Système stable",
    focus: null,
  };
}
