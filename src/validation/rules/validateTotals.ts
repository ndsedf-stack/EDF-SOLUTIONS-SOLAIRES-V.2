import { ValidationReport } from "../types";

export const validateTotals = (data: any): ValidationReport => {
  const errors: string[] = [];
  const details = data?.details;
  const detailsCash = data?.detailsCash;

  if (Array.isArray(details) && details.length > 0) {
    const lastVal = details[details.length - 1].cumulativeSavings;
    if (Math.abs(lastVal - (data?.totalSavingsProjected || 0)) > 1) {
      errors.push(
        "Incohérence : totalSavingsProjected ne correspond pas au cumul final."
      );
    }
  }

  if (Array.isArray(detailsCash) && detailsCash.length > 0) {
    const lastValCash = detailsCash[detailsCash.length - 1].cumulativeSavings;
    if (Math.abs(lastValCash - (data?.totalSavingsProjectedCash || 0)) > 1) {
      errors.push(
        "Incohérence : totalSavingsProjectedCash ne correspond pas au cumul final cash."
      );
    }
  }

  return {
    isValid: errors.length === 0,
    score: errors.length === 0 ? 100 : 0,
    errors,
    warnings: [],
    infos: [],
  };
};
