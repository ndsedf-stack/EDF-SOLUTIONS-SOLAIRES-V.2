import { getFailureProfiles, getSuccessProfiles } from "../decision/memory";

export function computeCancellationRisk(params: {
  dangerScore: number;
  tensionLevel: number;
  behavior: string;
}) {
  const failures = getFailureProfiles();
  const successes = getSuccessProfiles();

  if (failures.length + successes.length < 5) {
    // pas assez de données → fallback cerveau
    return Math.min(100, Math.round(params.dangerScore));
  }

  let score = 0;

  // base cerveau
  score += params.dangerScore * 0.5;
  score += params.tensionLevel * 0.3;

  // pattern comportement
  if (params.behavior === "muet") score += 15;
  if (params.behavior === "agite") score += 8;

  // auto-calibration
  const failureRate = failures.length / (failures.length + successes.length);

  score = score * (1 + failureRate);

  return Math.min(100, Math.round(score));
}
