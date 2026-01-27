import { Study, Metrics, FinancialStats } from "../types";

// =========================
// CALCULS FINANCIERS DÉTAILLÉS - REFONTE COMPLÈTE
// =========================
export function computeFinancialStats(
  studies: Study[],
  metrics: Metrics | null
): FinancialStats {
  if (!metrics || !metrics.warRoom || !metrics.finance) {
    return {
      cashSecured: 0,
      cashAtRisk: 0,
      warRoomCA: 0,
      securedCount: 0,
      riskCount: 0,
      warRoomCount: 0,
      lateCount: 0,
      lateNames: "—",
      nextDeadlineDate: "—",
      nextDeadlineClient: "—",
      caTotal: 0,
      tauxConversion: 0,
      cashWaitingDeposit: 0,
      waitingDepositCount: 0,
      cashCancellable: 0,
      cancellableCount: 0,
      cashAtFatigue: 0,
      securedPotential: 0,
    };
  }

  const now = new Date();

  // ✅ CORRECTION 1 : CA Total = UNIQUEMENT les signés
  const signedStudies = studies.filter((s) => s.status === "signed");
  const caTotal = signedStudies.reduce(
    (sum, s) => sum + (s.total_price || 0),
    0
  );

  // ✅ CA Sécurisé (Signé && (>14j || Acompte Payé))
  const secured = signedStudies.filter((s) => s.contract_secured);
  const cashSecured = secured.reduce((sum, s) => sum + (s.total_price || 0), 0);

  // ✅ Acomptes en attente (Signé && <14j && Acompte non payé && Besoin d'acompte)
  const waitingDeposit = signedStudies.filter((s) => 
    !s.contract_secured && 
    !s.deposit_paid && 
    s.has_deposit
  );
  const cashWaitingDeposit = waitingDeposit.reduce(
    (sum, s) => sum + 1500, // ✅ RÈGLE MÉTIER : ACOMPTE TOUJOURS 1500€
    0
  );

  // ✅ CA Annulable (Signé && <14j && Acompte non payé && PAS de besoin d'acompte)
  // Note: On exclut ceux qui attendent un acompte pour ne pas doubler dans la barre
  const cancellable = signedStudies.filter((s) => 
    !s.contract_secured && 
    !s.deposit_paid && 
    !s.has_deposit
  );
  const cashCancellable = cancellable.reduce(
    (sum, s) => sum + (s.total_price || 0),
    0
  );

  // 🚀 RAJOUT : CA à risque de fatigue (comportement "fatigue")
  const cashAtFatigue = metrics.behavioral.fatigues.reduce(
    (sum, s) => sum + (s.total_price || 0),
    0
  );

  // 🚀 RAJOUT : Potentiel sécurisé (CA total des études signées)
  const securedPotential = caTotal;


  // War Room et risques (inchangé)
  const criticalRisks = metrics.warRoom.studies;
  const cashAtRisk = metrics.finance.cashAtRisk;
  const warRoomCA = metrics.warRoom.ca;

  // Retards critiques (>10j sans acompte)
  const late = criticalRisks.filter((s) => {
    if (!s.signed_at) return false;
    const signedDate = new Date(s.signed_at);
    const daysSince = Math.floor(
      (now.getTime() - signedDate.getTime()) / 86400000
    );
    return daysSince > 10 && !s.deposit_paid;
  });

  const lateNames = late.map((s) => s.name).join(", ") || "Aucun retard";

  // Prochaine échéance (premier dossier à sortir du délai)
  const upcoming = cancellable
    .filter((s) => s.signed_at)
    .map((s) => ({
      name: s.name,
      signedDate: new Date(s.signed_at!),
      deadlineDate: new Date(
        new Date(s.signed_at!).getTime() + 14 * 24 * 60 * 60 * 1000
      ),
    }))
    .sort((a, b) => a.deadlineDate.getTime() - b.deadlineDate.getTime())[0];

  const nextDeadlineDate = upcoming
    ? upcoming.deadlineDate.toLocaleDateString("fr-FR")
    : "—";

  const nextDeadlineClient = upcoming
    ? upcoming.name
    : "Aucune échéance proche";

  // ✅ CORRECTION 3 : Taux de conversion = signés / total études
  const tauxConversion =
    studies.length > 0 ? (signedStudies.length / studies.length) * 100 : 0;

  return {
    cashSecured,
    cashAtRisk,
    warRoomCA,
    securedCount: secured.length,
    riskCount: criticalRisks.length,
    warRoomCount: metrics.warRoom.studies.length,
    lateCount: late.length,
    lateNames,
    nextDeadlineDate,
    nextDeadlineClient,
    caTotal,
    tauxConversion,
    // ✅ NOUVEAUX CHAMPS
    cashWaitingDeposit,
    waitingDepositCount: waitingDeposit.length,
    cashCancellable,
    cancellableCount: cancellable.length,
    // 🚀 RAJOUTS
    cashAtFatigue,
    securedPotential
  };
}
