export interface DecisionMemory {
  id: string;
  studyId: string;
  date: string;

  dangerScore: number;
  behavior: string;
  recommendedAction: string;

  systemState: string;
  tensionLevel: number;

  outcome?: "SUCCESS" | "FAILURE" | "PENDING";
  resolvedAt?: string;
  notes?: string;
}

// In-memory store (should be DB backed in real app)
const memory: DecisionMemory[] = [];

export function logDecision(entry: DecisionMemory) {
  memory.push(entry);
}

export function getDecisionMemory() {
  return memory;
}

export function resolveDecision(
  id: string,
  outcome: "SUCCESS" | "FAILURE",
  notes?: string
) {
  const item = memory.find((m) => m.id === id);
  if (!item) return;

  item.outcome = outcome;
  item.resolvedAt = new Date().toISOString();
  if (notes) item.notes = notes;
}

export function getFailureProfiles() {
  return memory.filter((m) => m.outcome === "FAILURE");
}

export function getSuccessProfiles() {
  return memory.filter((m) => m.outcome === "SUCCESS");
}
