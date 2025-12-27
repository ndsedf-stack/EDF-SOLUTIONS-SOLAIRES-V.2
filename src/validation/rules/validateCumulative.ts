import { ValidationReport } from "../types";

export const validateCumulative = (data: any): ValidationReport => {
  const errors: string[] = [];
  const checkMonotony = (arr: any[], key: string) => {
    let last = -Infinity;
    arr.forEach((item, i) => {
      if (item[key] < last)
        errors.push(`Décroissance illogique sur ${key} à l'index ${i}.`);
      last = item[key];
    });
  };

  if (Array.isArray(data?.details))
    checkMonotony(data.details, "cumulativeSavings");
  if (Array.isArray(data?.detailsCash))
    checkMonotony(data.detailsCash, "cumulativeSavings");

  return {
    isValid: errors.length === 0,
    score: errors.length === 0 ? 100 : 50,
    errors,
    warnings: [],
    infos: [],
  };
};
