import { ValidationReport } from "../../types";

export const validateGraphs = (data: any): ValidationReport => {
  const errors: any[] = [];
  const warnings: any[] = [];

  // Vérification que les versions "sliced" (utilisées par l'UI) sont présentes et valides
  const series = ["slicedDetails", "slicedDetailsCash"];

  series.forEach((key) => {
    const arr = data?.[key];

    if (!Array.isArray(arr) || arr.length === 0) {
      errors.push({
        severity: "ERROR" as const,
        category: "GRAPHIQUES",
        message: `La série graphique ${key} est vide ou manquante.`,
        actual: key,
      });
    } else if (arr.some((v: any) => !Number.isFinite(v.cumulativeSavings))) {
      errors.push({
        severity: "ERROR" as const,
        category: "GRAPHIQUES",
        message: `La série ${key} contient des valeurs non-finies (NaN/Inf).`,
        actual: key,
      });
    }
  });

  return {
    errors, // ✅ Retourne le tableau construit
    warnings,
    info: [],
    isValid: errors.length === 0,
    score: errors.length === 0 ? 100 : 0,
  };
};
