import { Study } from "../types";

// =========================
// DÉTECTION ANOMALIES
// =========================
export function detectAnomalies(
  studies: Study[],
  settings = { view_threshold: 5, day_threshold: 3 }
): string[] {
  const anomalies: string[] = [];
  studies.forEach((s) => {
    if (
      s.status === "sent" &&
      s.views > settings.view_threshold &&
      s.clicks === 0
    ) {
      anomalies.push(s.id);
    }
    if (
      s.status === "signed" &&
      s.diffDays > settings.day_threshold &&
      s.views < 2
    ) {
      anomalies.push(s.id);
    }
  });
  return anomalies;
}
