export type ProcessViolation = {
  rule: string
  studyId: string
  message: string
}

export class ProcessGuardError extends Error {
  violations: ProcessViolation[]

  constructor(violations: ProcessViolation[]) {
    super("PROCESS_GUARD_VIOLATION")
    this.violations = violations
  }
}

export class ProcessGuard {
  static enforce(study: {
    id: string
    status: string
    quiz_completed: boolean
    deposit_paid: boolean
    signed_at?: string | null
  }) {
    const violations: ProcessViolation[] = []

    // 🛑 Rule 1 — Signature interdite sans quiz
    if (study.status === "signed" && !study.quiz_completed) {
      violations.push({
        rule: "SIGN_WITHOUT_QUIZ",
        studyId: study.id,
        message: "Signature impossible sans quiz complété",
      })
    }

    // 🛑 Rule 2 — Passage en installation sans acompte
    if (study.status === "installation" && !study.deposit_paid) {
      violations.push({
        rule: "INSTALL_WITHOUT_DEPOSIT",
        studyId: study.id,
        message: "Installation impossible sans acompte",
      })
    }

    // 🛑 Rule 3 — Clôture sans signature
    if (study.status === "closed" && !study.signed_at) {
      violations.push({
        rule: "CLOSE_WITHOUT_SIGNATURE",
        studyId: study.id,
        message: "Clôture impossible sans signature",
      })
    }

    if (violations.length > 0) {
      throw new ProcessGuardError(violations)
    }
  }
}
