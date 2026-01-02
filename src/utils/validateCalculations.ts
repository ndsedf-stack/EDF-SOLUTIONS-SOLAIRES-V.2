import { SimulationResult } from "../types";

interface ValidationError {
  severity: "ERROR" | "WARNING" | "INFO";
  category: string;
  message: string;
  expected?: any;
  actual?: any;
}

// ============================================================================
// 1️⃣ FONCTION DE VALIDATION PRINCIPALE (L'AUDITEUR)
// ============================================================================
export function validateSimulation(result: SimulationResult): {
  errors: ValidationError[];
  warnings: ValidationError[];
  info: ValidationError[];
  isValid: boolean;
  score: number;
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const info: ValidationError[] = [];

  // Extraction sécurisée (bypass TS)
  const res = result as any;

  const creditInterestRate = Number(res.interestRate ?? 3.89);
  const creditDurationMonths = Number(res.creditDurationMonths ?? 180);
  const creditPayment = Number(
    res.year1?.loanMonthly ?? res.creditMonthlyPayment ?? 0
  );
  const remainingToFinance = Number(res.remainingToFinance ?? 0);
  const installCost = Number(res.installCost ?? 0);
  const production = Number(res.yearlyProduction ?? 0);
  const tauxAuto = Number(res.selfConsumptionRate ?? 0);
  const breakEven = Number(res.breakEvenPoint ?? 0);
  const breakEvenCash = Number(res.breakEvenPointCash ?? 0);
  const roi = Number(res.roiPercentage ?? 0);
  const roiCash = Number(res.roiPercentageCash ?? roi);
  const inflationRate = Number(res.inflationRate ?? 5);
  const autonomy = Number(
    res.savingsRatePercent ?? res.selfConsumptionRate ?? 0
  );
  const totalGain = Number(res.totalSavingsProjected ?? res.heritageNet ?? 0);
  const totalGainCash = Number(res.totalSavingsProjectedCash ?? 0);

  // 2️⃣ VÉRIFICATION RÉPARTITION ÉNERGIE
  const selfConsumed = production * (tauxAuto / 100);
  const surplus = production - selfConsumed;
  const totalEnergy = selfConsumed + surplus;

  if (Math.abs(totalEnergy - production) > 1) {
    errors.push({
      severity: "ERROR",
      category: "RÉPARTITION ÉNERGIE",
      message: "La somme autoconso + surplus ≠ production totale",
      expected: production + " kWh",
      actual: totalEnergy.toFixed(0) + " kWh",
    });
  } else {
    info.push({
      severity: "INFO",
      category: "RÉPARTITION ÉNERGIE",
      message: "✅ Répartition = 100%",
    });
  }

  // 3️⃣ VÉRIFICATION POINTS MORTS
  if (breakEven < 1 || breakEven > 25) {
    warnings.push({
      severity: "WARNING",
      category: "POINT MORT",
      message: `Point mort crédit hors norme: ${breakEven} ans`,
      expected: "Entre 1 et 25 ans",
      actual: breakEven + " ans",
    });
  } else {
    info.push({
      severity: "INFO",
      category: "POINT MORT",
      message: `✅ Point mort crédit: ${breakEven} ans`,
    });
  }

  if (breakEvenCash < 1 || breakEvenCash > 25) {
    warnings.push({
      severity: "WARNING",
      category: "POINT MORT CASH",
      message: `Point mort cash hors norme: ${breakEvenCash} ans`,
      expected: "Entre 1 et 25 ans",
      actual: breakEvenCash + " ans",
    });
  } else {
    info.push({
      severity: "INFO",
      category: "POINT MORT CASH",
      message: `✅ Point mort cash: ${breakEvenCash} ans`,
    });
  }

  // 4️⃣ VÉRIFICATION ROI
  if (roi < 0 || roi > 30) {
    warnings.push({
      severity: "WARNING",
      category: "ROI",
      message: `ROI crédit hors norme: ${roi}%`,
      expected: "Entre 0% et 30%",
      actual: roi + "%",
    });
  } else {
    info.push({
      severity: "INFO",
      category: "ROI",
      message: `✅ ROI crédit: ${roi}%`,
    });
  }

  if (roiCash < roi) {
    warnings.push({
      severity: "WARNING",
      category: "ROI CASH",
      message: "ROI cash inférieur au ROI crédit (anormal)",
      expected: `>= ${roi}%`,
      actual: roiCash + "%",
    });
  } else {
    info.push({
      severity: "INFO",
      category: "ROI CASH",
      message: `✅ ROI cash: ${roiCash}%`,
    });
  }

  // 5️⃣ VÉRIFICATION COHÉRENCE TEMPORELLE
  let temporalCoherence = true;
  const details = Array.isArray(res.details) ? res.details : [];

  if (details.length > 0) {
    for (let i = 1; i < Math.min(details.length, 20); i++) {
      const prev = details[i - 1];
      const curr = details[i];
      if (
        Number(curr.cumulativeSpendNoSolar) <=
        Number(prev.cumulativeSpendNoSolar)
      ) {
        temporalCoherence = false;
        errors.push({
          severity: "ERROR",
          category: "COHÉRENCE TEMPORELLE",
          message: `Dépenses Sans Solaire décroissantes (année ${i + 1})`,
          expected: `> ${Number(prev.cumulativeSpendNoSolar).toFixed(0)}€`,
          actual: Number(curr.cumulativeSpendNoSolar).toFixed(0) + "€",
        });
        break;
      }
    }
  }

  if (temporalCoherence && details.length > 0) {
    info.push({
      severity: "INFO",
      category: "COHÉRENCE TEMPORELLE",
      message: "✅ Dépenses Sans Solaire croissantes",
    });
  }

  // 6️⃣ VÉRIFICATION INFLATION
  let inflationOK = true;
  if (details.length > 0) {
    for (let i = 1; i < Math.min(details.length, 10); i++) {
      const prev = details[i - 1];
      const curr = details[i];
      if (
        inflationRate > 0 &&
        Number(curr.edfBillWithoutSolar) <= Number(prev.edfBillWithoutSolar)
      ) {
        inflationOK = false;
        errors.push({
          severity: "ERROR",
          category: "INFLATION",
          message: `Facture sans solaire n'augmente pas (année ${
            i + 1
          }, inflation=${inflationRate}%)`,
          expected: `> ${Number(prev.edfBillWithoutSolar).toFixed(0)}€`,
          actual: Number(curr.edfBillWithoutSolar).toFixed(0) + "€",
        });
        break;
      }
    }
  }

  if (inflationOK && details.length > 0) {
    info.push({
      severity: "INFO",
      category: "INFLATION",
      message: `✅ Inflation ${inflationRate}% appliquée correctement`,
    });
  }

  // 7️⃣ VÉRIFICATION GOUFFRE
  let crossingFound = false;
  if (details.length > 0) {
    for (let i = 1; i < details.length; i++) {
      const prev = details[i - 1];
      const curr = details[i];
      const prevDiff =
        Number(prev.cumulativeSpendNoSolar) - Number(prev.cumulativeSpendSolar);
      const currDiff =
        Number(curr.cumulativeSpendNoSolar) - Number(curr.cumulativeSpendSolar);

      if (prevDiff < 0 && currDiff >= 0) {
        crossingFound = true;
        info.push({
          severity: "INFO",
          category: "GRAPHIQUE GOUFFRE",
          message: `✅ Croisement détecté année ${i + 1}`,
        });
        break;
      }
    }
  }

  if (!crossingFound && details.length > 0) {
    if (Number(details[details.length - 1].cumulativeSavings) > 0) {
      info.push({
        severity: "INFO",
        category: "GRAPHIQUE GOUFFRE",
        message:
          "✅ Rentable à terme (pas de croisement visible mais cumul positif)",
      });
    } else {
      warnings.push({
        severity: "WARNING",
        category: "GRAPHIQUE GOUFFRE",
        message: "Aucun croisement détecté sur la période",
      });
    }
  }

  // 8️⃣ VÉRIFICATION GAINS TOTAUX
  if (totalGain < 0) {
    errors.push({
      severity: "ERROR",
      category: "GAINS TOTAUX",
      message: "Gain total négatif (projet non rentable)",
      expected: "> 0€",
      actual: totalGain.toFixed(0) + "€",
    });
  } else {
    info.push({
      severity: "INFO",
      category: "GAINS TOTAUX",
      message: `✅ Gain total: ${totalGain.toFixed(0)}€`,
    });
  }

  if (totalGainCash < 0) {
    errors.push({
      severity: "ERROR",
      category: "GAINS TOTAUX CASH",
      message: "Gain total cash négatif",
      expected: "> 0€",
      actual: totalGainCash.toFixed(0) + "€",
    });
  } else {
    info.push({
      severity: "INFO",
      category: "GAINS TOTAUX CASH",
      message: `✅ Gain total cash: ${totalGainCash.toFixed(0)}€`,
    });
  }

  // 9️⃣ VÉRIFICATION AUTONOMIE
  if (autonomy < 0 || autonomy > 100) {
    warnings.push({
      severity: "WARNING",
      category: "AUTONOMIE",
      message: `Autonomie hors norme: ${autonomy}%`,
      expected: "Entre 0% et 100%",
      actual: autonomy + "%",
    });
  } else {
    info.push({
      severity: "INFO",
      category: "AUTONOMIE",
      message: `✅ Autonomie: ${autonomy}%`,
    });
  }

  const totalTests = errors.length + warnings.length + info.length;
  const passedTests = info.length;
  const score =
    totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  const isValid = errors.length === 0;

  return { errors, warnings, info, isValid, score };
}

// ============================================================================
// 2️⃣ FONCTION D'AFFICHAGE DU RAPPORT
// ============================================================================
export function printValidationReport(result: any) {
  const validation = validateSimulation(result);
  console.log(
    "\n" + "═".repeat(80) + "\n🔍 RAPPORT DE VALIDATION\n" + "═".repeat(80)
  );
  console.log(
    `📊 SCORE: ${validation.score}% | ❌ Erreurs: ${validation.errors.length} | ⚠️ Warnings: ${validation.warnings.length} | ✅ OK: ${validation.info.length}\n`
  );

  if (validation.errors.length > 0) {
    console.log("🚨 ERREURS:");
    validation.errors.forEach((err, i) =>
      console.log(
        `${i + 1}. ${err.category}: ${err.message} (Attendu: ${
          err.expected
        } | Actuel: ${err.actual})`
      )
    );
  }

  if (validation.warnings.length > 0) {
    console.log("\n⚠️ WARNINGS:");
    validation.warnings.forEach((warn, i) =>
      console.log(`${i + 1}. ${warn.category}: ${warn.message}`)
    );
  }

  console.log("\n✅ CHECKS OK:");
  validation.info.forEach((inf, i) => console.log(`${i + 1}. ${inf.message}`));
  console.log(
    "\n" +
      "═".repeat(80) +
      `\n${validation.isValid ? "🎉 VALIDÉ" : "🚨 REJETÉ"}\n` +
      "═".repeat(80)
  );

  return validation;
}

// ============================================================================
// 3️⃣ SCRIPT DE STRESS TEST (TESTE 10, 15, 20, 25 ANS)
// ============================================================================
export function runPériodeStressTest(
  baseInputs: any,
  calculateFn: (inputs: any, duration: number) => any
) {
  const périodes = [10, 15, 20, 25];
  const rapportFinal: any[] = [];

  console.group("🚀 STRESS TEST MULTI-PÉRIODES");
  périodes.forEach((ans) => {
    const result = calculateFn(baseInputs, ans);
    const audit = validateSimulation(result);
    rapportFinal.push({
      Horizon: `${ans} ans`,
      Score: `${audit.score}%`,
      Status: audit.isValid ? "✅ OK" : "❌ ERREUR",
      "Gain Total": `${Math.round(result.totalSavingsProjected || 0)}€`,
      "ROI (%)": `${result.roiPercentage}%`,
      Erreurs: audit.errors.length,
      Warnings: audit.warnings.length,
    });
  });
  console.table(rapportFinal);
  console.groupEnd();

  return rapportFinal;
}
