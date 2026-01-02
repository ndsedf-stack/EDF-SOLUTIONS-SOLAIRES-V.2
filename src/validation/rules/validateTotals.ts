import { ValidationReport } from "../../types";

export const validateTotals = (data: any): ValidationReport => {
  const errors: any[] = []; // Changé en any[] pour stocker des ValidationError
  const warnings: any[] = [];

  const details = data?.details;
  const detailsCash = data?.detailsCash;

  if (Array.isArray(details) && details.length > 0) {
    const lastVal = details[details.length - 1].cumulativeSavings;
    if (Math.abs(lastVal - (data?.totalSavingsProjected || 0)) > 1) {
      errors.push({
        severity: "ERROR" as const,
        category: "TOTAUX",
        message:
          "Incohérence : totalSavingsProjected ne correspond pas au cumul final.",
        expected: lastVal,
        actual: data?.totalSavingsProjected || 0,
      });
    }
  }

  if (Array.isArray(detailsCash) && detailsCash.length > 0) {
    const lastValCash = detailsCash[detailsCash.length - 1].cumulativeSavings;
    if (Math.abs(lastValCash - (data?.totalSavingsProjectedCash || 0)) > 1) {
      errors.push({
        severity: "ERROR" as const,
        category: "TOTAUX CASH",
        message:
          "Incohérence : totalSavingsProjectedCash ne correspond pas au cumul final cash.",
        expected: lastValCash,
        actual: data?.totalSavingsProjectedCash || 0,
      });
    }
  }

  return {
    errors, // ✅ Retourne le tableau construit
    warnings,
    info: [],
    isValid: errors.length === 0, // ✅ Dynamique
    score: errors.length === 0 ? 100 : 0, // ✅ Dynamique
  };
};
