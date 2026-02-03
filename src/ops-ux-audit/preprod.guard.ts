/**
 * PRE-PROD GUARD 🛡️
 * 
 * Enforces strict quality gates before allowing a deployment or promotion to production.
 * "A dashboard that lies cannot go to prod."
 */

export function assertPreprodReadiness(input: {
  uxScore: number;
  dataBreaches: number;
  previousUxScore?: number; // Optional history check
}) {
  console.log("🛡️ RUNNING PRE-PROD GUARD CHECK...");
  console.log(`INPUT: UX Score = ${input.uxScore}/100 | Data Breaches = ${input.dataBreaches}`);

  // 1. DATA TRUTH CHECK
  if (input.dataBreaches > 0) {
    throw new Error(
      `⛔ PREPROD_BLOCKED: DATA_INTEGRITY_BREACH (${input.dataBreaches} detected). The system cannot guarantee data truth.`
    );
  }

  // 2. UX INTEGRITY CHECK
  if (input.uxScore < 60) {
    throw new Error(
      `⛔ PREPROD_BLOCKED: UX_INTEGRITY_FAILURE (Score: ${input.uxScore} < 60). The visualization is considered unsafe for decision making.`
    );
  }

  // 3. REGRESSION CHECK (TIME TRAVEL GUARD)
  if (input.previousUxScore !== undefined && input.uxScore < input.previousUxScore) {
      throw new Error(
          `⛔ PREPROD_BLOCKED: UX_REGRESSION_DETECTED (Current: ${input.uxScore} < Prev: ${input.previousUxScore}). Quality must not degrade.`
      );
  }

  console.log("✅ PRE-PROD GUARD PASSED. SYSTEM IS SAFE.");
  return true;
}
