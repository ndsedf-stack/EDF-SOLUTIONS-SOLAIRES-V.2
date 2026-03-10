import React from 'react';

interface HeroChartContainerProps {
  children: React.ReactNode;
  height?: number; // default 520px
  className?: string;
}

export const HeroChartContainer: React.FC<HeroChartContainerProps> = ({ 
  children, 
  height = 520,
  className = ''
}) => {
  return (
    <div 
      className={`
        w-full relative overflow-hidden
        bg-brand-card border border-white/5 rounded-[20px] 
        shadow-card p-12
        ${className}
      `}
      style={{ height: `${height}px` }}
    >
      {children}
    </div>
  );
};
