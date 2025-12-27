import { ValidationReport } from "../types";

export const validateROI = (data: any): ValidationReport => {
  const errors: string[] = [];
  const roi = data?.roiPercentage;

  if (typeof roi !== "number" || isNaN(roi)) {
    errors.push("ROI invalide ou manquant.");
  } else if (roi > 0 && data?.totalSavingsProjected <= 0) {
    errors.push("ROI positif incohérent avec des économies négatives.");
  }

  return {
    isValid: errors.length === 0,
    score: errors.length === 0 ? 100 : 20,
    errors,
    warnings: [],
    infos: [],
  };
};
