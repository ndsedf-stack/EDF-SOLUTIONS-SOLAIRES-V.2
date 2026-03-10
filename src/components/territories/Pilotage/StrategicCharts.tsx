import React from 'react';

interface StrategicChartsProps {
  activeTab: any;
  data: any;
}

export const StrategicCharts: React.FC<StrategicChartsProps> = () => {
    return (
        <div className="w-full h-64 flex items-center justify-center border border-dashed border-white/20 rounded-xl bg-white/5">
           <p className="text-white/50 text-sm font-mono">Strategic Chart: Visx Migration...</p>
        </div>
      );
};
