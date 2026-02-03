export function auditDataIntegrity(rawMax: number, renderedMax: number) {
  if (renderedMax < rawMax) {
    return {
      severity: "CRITICAL" as const,
      message: "Rendered value is lower than raw data",
      recommendation: "Fix scale or clipping in chart renderer",
      code: "DATA_MISMATCH"
    };
  }
  return null;
}
