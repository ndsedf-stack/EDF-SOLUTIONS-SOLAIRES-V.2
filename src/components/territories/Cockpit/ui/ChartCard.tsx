import React from 'react';
import { ParentSize } from '@visx/responsive';

interface ChartCardProps {
  title: string;
  question: string;
  children: (width: number, height: number) => React.ReactNode;
  height?: number;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({ 
    title, 
    question, 
    children, 
    height = 300,
    className = ""
}) => {
  return (
    <div className={`bg-[#0F1629] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col ${className}`}>
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">
          {title}
        </h3>
        <p className="text-sm font-semibold text-slate-300 italic opacity-60">
          "{question}"
        </p>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6" style={{ height }}>
        <ParentSize>
          {({ width, height }) => children(width, height)}
        </ParentSize>
      </div>
    </div>
  );
};
