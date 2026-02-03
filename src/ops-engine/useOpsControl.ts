import { evaluateOpsDecision, OpsContext, OpsDecision } from "./ops.engine";

/**
 * 🧠 OPS CONTROL HOOK (SAFE MODE / MIRROR MODE)
 * Observe, mais ne touche à rien.
 * Loggue les décisions dans la console en DEV.
 */
export function useOpsControl(input: OpsContext): OpsDecision {
  const decision = evaluateOpsDecision(input);

  if (process.env.NODE_ENV === "development") {
    // Group logs to avoid spamming, identified by ID if available (not in strict OpsContext but useful if we wrapper it)
    // For now strict adhere to user requested implementations
    console.groupCollapsed(`🧠 OPS ENGINE — MIRROR DECISION`);
    console.log("📥 Input Context:", input);
    console.log("🤖 Decision Verdict:", decision);
    console.groupEnd();
  }

  return decision;
}
