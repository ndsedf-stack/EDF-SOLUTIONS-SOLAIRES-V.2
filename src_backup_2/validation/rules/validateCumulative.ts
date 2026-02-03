import { ValidationReport } from "../../types";

export const validateCumulative = (data: any): ValidationReport => {
  const errors: any[] = [];
  const warnings: any[] = [];

  const checkMonotony = (arr: any[], key: string, seriesName: string) => {
    let last = -Infinity;
    arr.forEach((item, i) => {
      if (item[key] < last) {
        errors.push({
          severity: "ERROR" as const,
          category: "MONOTONIE",
          message: `Décroissance illogique sur ${seriesName}.${key} à l'index ${i}.`,
          expected: `>= ${last}`,
          actual: item[key],
        });
      }
      last = item[key];
    });
  };

  if (Array.isArray(data?.details)) {
    checkMonotony(data.details, "cumulativeSavings", "details");
  }

  if (Array.isArray(data?.detailsCash)) {
    checkMonotony(data.detailsCash, "cumulativeSavings", "detailsCash");
  }

  return {
    errors, // ✅ Retourne le tableau construit
    warnings,
    info: [],
    isValid: errors.length === 0,
    score: errors.length === 0 ? 100 : 0,
  };
};
