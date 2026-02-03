import { ValidationReport } from "../../types";

export const validateROI = (data: any): ValidationReport => {
  const errors: any[] = [];
  const warnings: any[] = [];

  const roi = data?.roiPercentage;

  if (typeof roi !== "number" || isNaN(roi)) {
    errors.push({
      severity: "ERROR" as const,
      category: "ROI",
      message: "ROI invalide ou manquant.",
      actual: roi,
    });
  } else if (roi > 0 && data?.totalSavingsProjected <= 0) {
    errors.push({
      severity: "ERROR" as const,
      category: "ROI",
      message: "ROI positif incohérent avec des économies négatives.",
      expected: "ROI négatif ou nul",
      actual: `ROI: ${roi}%, Économies: ${data?.totalSavingsProjected}€`,
    });
  }

  return {
    errors, // ✅ Retourne le tableau construit
    warnings,
    info: [],
    isValid: errors.length === 0,
    score: errors.length === 0 ? 100 : 0,
  };
};
