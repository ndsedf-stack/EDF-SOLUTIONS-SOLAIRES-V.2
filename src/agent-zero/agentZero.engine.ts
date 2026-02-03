import {
  AgentZeroInput,
  AgentZeroDecision,
  DecisionState,
} from "./agentZero.types";

export function agentZeroEngine(
  input: AgentZeroInput
): AgentZeroDecision {
  const state = resolveDecisionState(input);

  return {
    state,
    permissions: resolvePermissions(state),
    locks: resolveLocks(state),
    nudges: resolveNudges(state, input),
    audit: buildAudit(state, input),
  };
}

/* ------------------ INTERNALS ------------------ */

/**
 * RESOLVE DECISION STATE (MACHINE A ÉTATS MONOTONE)
 *
 * Règles Canoniques :
 * 1. Monotonie : On ne revient JAMAIS en arrière.
 * 2. Cadenas : Chaque palier (LUCIDITY, DECISION) est un cliquet.
 * 3. Atomicité : Un état détermine TOUTES les permissions.
 *
 * Cette fonction est la SEULE source de vérité du state.
 */
function resolveDecisionState(input: AgentZeroInput): DecisionState {
  if (input.decision.isSigned) return "SECURED";

  if (input.decision.hasReachedDecisionAnchor)
    return "DECISION_OPEN";

  if (
    input.decision.hasSeenProjection &&
    input.decision.hasSeenBudgetModule
  )
    return "LUCIDITY_POINT";

  if (input.decision.hasSeenCoreProofs)
    return "CONFRONTATION";

  return "STRUCTURATION";
}

function resolvePermissions(state: DecisionState) {
  return {
    budget: true,
    projection:
      state !== "DISCOVERY",
    decisionAnchor:
      state === "LUCIDITY_POINT" || state === "DECISION_OPEN",
    signature:
      state === "DECISION_OPEN",
  };
}

function resolveLocks(state: DecisionState) {
  return {
    lockNavigation:
      state === "DECISION_OPEN" || state === "SECURED",
    freezeAfterSign:
      state === "SECURED",
  };
}

function resolveNudges(
  state: DecisionState,
  input: AgentZeroInput
) {
  if (state === "DECISION_OPEN" && input.user.fatigueScore > 70) {
    return ["pause", "no_urgency"];
  }

  return [];
}

/**
 * Génère un hash simple pour sceller la décision.
 * (Anti-litige / Preuve d'intégrité)
 */
function generateDecisionHash(context: any): string {
  const str = JSON.stringify(context);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return "AZ-" + Math.abs(hash).toString(16).toUpperCase();
}

function buildAudit(
  state: DecisionState,
  input: AgentZeroInput
) {
  const decisionContext = {
    budgetSeen: input.decision.hasSeenBudgetModule,
    projectionSeen: input.decision.hasSeenProjection,
    anchorReached: input.decision.hasReachedDecisionAnchor,
  };

  return {
    timestamp: Date.now(),
    state,
    modulesSeen: input.session.openedModules,
    objectionsOpened:
      input.riskSignals.popupObjectionsOpened,
    decisionContext,
    decisionHash: generateDecisionHash({ state, decisionContext, timestamp: Date.now() })
  };
}
