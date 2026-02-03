// THE 8PT GRID SYSTEM (NON-NEGOTIABLE)
export const grid = (n: number) => n * 8;

export const COLORS = {
  CRITICAL: [170, 70, 70], // High (Red desaturated)
  HIGH: [180, 140, 60],    // Medium (Gold desaturated)
  LOW: [60, 110, 100],     // Low (Teal desaturated)
  
  // Premium Greyscale
  TEXT_DARK: [20, 20, 20],
  TEXT_MAIN: [45, 45, 45],
  TEXT_MUTED: [140, 140, 140],
  
  LINE: [220, 220, 220],
  
  // Skyline Zones
  ZONE_HIGH: [230, 230, 230],
  ZONE_MED: [245, 235, 215],
  ZONE_LOW: [245, 220, 220],
};

import jsPDF from "jspdf";

export function addTitle(doc: jsPDF, text: string, x: number, y: number) {
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(34, 34, 34);
    doc.text(text, x, y);
    // Underline
    const textWidth = doc.getTextWidth(text);
    doc.setDrawColor(34, 34, 34);
    doc.line(x, y + 2, x + textWidth, y + 2);
}

export function addParagraph(doc: jsPDF, text: string, x: number, y: number, maxWidth: number = 180) {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    
    // Return height usage estimation if needed later, but for now simple void
}
