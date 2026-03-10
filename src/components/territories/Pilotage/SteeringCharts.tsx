import React from 'react';

interface SteeringChartsProps {
  studies: any[];
  emailLeads: any[];
}

export const SteeringCharts: React.FC<SteeringChartsProps> = () => {
    return (
        <div className="w-full h-64 flex items-center justify-center border border-dashed border-white/20 rounded-xl bg-white/5">
           <p className="text-white/50 text-sm font-mono">Steering Chart: Visx Migration...</p>
        </div>
      );
};
