import { COLORS, grid } from "../pdf.utils";

export function renderRiskSkyline(
  pdf: any,
  data: number[], // Array of historical risk values (0-100)
  startY: number
): number {
  const marginX = 25;
  const chartWidth = 160;
  // Chart Height should be grid aligned roughly? 50 is close to 48 (grid(6)). Let's use 48.
  const chartHeight = grid(6); 

  // Zones (Background)
  const zones = [
    { y: startY, color: COLORS.ZONE_HIGH, h: grid(2) },      // 16
    { y: startY + grid(2), color: COLORS.ZONE_MED, h: grid(2) },
    { y: startY + grid(4), color: COLORS.ZONE_LOW, h: grid(2) },
  ];

  zones.forEach(z => {
    // @ts-ignore
    pdf.setFillColor(...z.color);
    pdf.rect(marginX, z.y, chartWidth, z.h, "F");
  });

  // Skyline Bars
  const safeData = data && data.length > 0 ? data : [50, 50, 50, 50, 50]; 
  const barWidth = chartWidth / safeData.length;

  pdf.setFillColor(80, 80, 80); // Charcoal bars

  safeData.forEach((v, i) => {
    // Height 'h' corresponds to magnitude (0-chartHeight)
    const h = (v / 100) * chartHeight;
    pdf.rect(
      marginX + i * barWidth,
      startY + chartHeight - h,
      barWidth * 0.6, // Gaps between bars
      h,
      "F"
    );
  });

  // Return consumed space: Chart + Padding
  // User spec: TOTAL_HEIGHT = 50 + 16 (chart + padding)
  // Our chart is 48. Padding 16 (grid(2)).
  return startY + chartHeight + grid(2);
}
