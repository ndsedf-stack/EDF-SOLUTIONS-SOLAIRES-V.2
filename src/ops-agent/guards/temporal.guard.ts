// import { differenceInHours } from "date-fns"; // Removed dependency

export type TemporalViolation = {
  studyId: string;
  lastStep: string;
  attemptedStep: string;
  lastExecutedAt: string;
  attemptedAt: string;
  reason: string;
};

// Internal Logic (Pure)
function assertTemporalVelocity(params: {
  studyId: string;
  lastEmailStep: {
    step: string;
    executedAt: string;
  } | null;
  nextStep: string;
  now: Date;
}): TemporalViolation | null {
  const { studyId, lastEmailStep, nextStep, now } = params;

  // Aucun historique → autorisé
  if (!lastEmailStep) return null;

  // const hoursSinceLastStep = differenceInHours(now, new Date(lastEmailStep.executedAt));
  const diffMs = now.getTime() - new Date(lastEmailStep.executedAt).getTime();
  const hoursSinceLastStep = diffMs / (1000 * 60 * 60);

  // ⛔ RÈGLE DURE : 1 étape / 24h
  if (hoursSinceLastStep < 24) {
    return {
      studyId,
      lastStep: lastEmailStep.step,
      attemptedStep: nextStep,
      lastExecutedAt: lastEmailStep.executedAt,
      attemptedAt: now.toISOString(),
      reason: `Temporal velocity breach (${hoursSinceLastStep}h < 24h)`,
    };
  }

  return null;
}

export class TemporalGuard {
  static check(study: any) {
    // Adapter: Map study object to internal assert params
    // Assuming study has 'last_email_sent_at' or similar from context
    if (!study.last_email_sent_at) return; // No history, pass

    const violation = assertTemporalVelocity({
      studyId: study.id,
      lastEmailStep: {
        step: "unknown_previous", // We might not know exact step name strictly from study obj
        executedAt: study.last_email_sent_at
      },
      nextStep: "next_email", // Generic placeholder
      now: new Date()
    });

    if (violation) {
      throw new Error(`TEMPORAL_GUARD_VIOLATION: ${violation.reason}`);
    }
  }

  // Version non-bloquante pour inspection ou usage manuel (ex: sendNextEmail)
  static assess(params: {
    studyId: string;
    lastEmailStep: {
        step: string;
        executedAt: string;
    } | null;
    nextStep: string;
    now: Date;
  }) {
    return assertTemporalVelocity(params);
  }
}
