import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// mock Recharts simplifié
vi.mock("recharts", () => {
  return {
    CartesianGrid: () => null,
    LineChart: ({ children }: any) => (
      <div data-testid="line-chart">{children}</div>
    ),
    Line: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    AreaChart: ({ children }: any) => (
      <div data-testid="area-chart">{children}</div>
    ),
    Area: () => null,
    PieChart: ({ children }: any) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Pie: () => null,
    ReferenceArea: () => null,
    ReferenceLine: () => null,
  };
});
