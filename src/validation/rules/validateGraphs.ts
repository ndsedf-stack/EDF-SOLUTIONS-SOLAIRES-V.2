import { ValidationReport } from "../types";

export const validateGraphs = (data: any): ValidationReport => {
  const errors: string[] = [];
  // Vérification que les versions "sliced" (utilisées par l'UI) sont présentes et valides
  const series = ["slicedDetails", "slicedDetailsCash"];

  series.forEach((key) => {
    const arr = data?.[key];
    if (!Array.isArray(arr) || arr.length === 0) {
      errors.push(`La série graphique ${key} est vide ou manquante.`);
    } else if (arr.some((v: any) => !Number.isFinite(v.cumulativeSavings))) {
      errors.push(`La série ${key} contient des valeurs non-finies (NaN/Inf).`);
    }
  });

  return {
    isValid: errors.length === 0,
    score: errors.length === 0 ? 100 : 0,
    errors,
    warnings: [],
    infos: [],
  };
};
