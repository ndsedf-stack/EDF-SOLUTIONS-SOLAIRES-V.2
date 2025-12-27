import { ValidationReport } from "./types";
import { validateTotals } from "./rules/validateTotals";
import { validateCumulative } from "./rules/validateCumulative";
import { validateGraphs } from "./rules/validateGraphs";
import { validateROI } from "./rules/validateROI";

const RULES = [validateTotals, validateCumulative, validateGraphs, validateROI];

export const validateAll = (data: any): ValidationReport => {
  const reports = RULES.map((rule) => rule(data));
  const aggregated = reports.reduce(
    (acc, curr) => ({
      isValid: acc.isValid && curr.isValid,
      score: acc.score + curr.score,
      errors: [...acc.errors, ...curr.errors],
      warnings: [...acc.warnings, ...curr.warnings],
      infos: [...acc.infos, ...curr.infos],
    }),
    {
      isValid: true,
      score: 0,
      errors: [],
      warnings: [],
      infos: [],
    } as ValidationReport
  );

  return {
    ...aggregated,
    score: Math.round(aggregated.score / RULES.length),
  };
};
