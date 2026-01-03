import React from "react";

export const LineChart = ({ children }: any) => (
  <div data-testid="line-chart">{children}</div>
);
export const Line = () => null;
export const XAxis = () => null;
export const YAxis = () => null;
export const Tooltip = () => null;
export const Legend = () => null;

export const ResponsiveContainer = ({ children }: any) => <div>{children}</div>;
export const AreaChart = ({ children }: any) => (
  <div data-testid="area-chart">{children}</div>
);
export const Area = () => null;
export const PieChart = ({ children }: any) => (
  <div data-testid="pie-chart">{children}</div>
);
export const Pie = () => null;

export const ReferenceArea = () => null;
export const ReferenceLine = () => null;
