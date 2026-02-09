import React from 'react';
import { formatCurrency } from '../../utils/finance';

interface Props {
  savingsYear10: number;
  savingsYear20: number;
  savingsYear25: number;
}

export const Timeline: React.FC<Props> = ({ savingsYear10, savingsYear20, savingsYear25 }) => {
  const points = [
    { label: 'Année 10', value: savingsYear10, color: 'text-blue-400' },
    { label: 'Année 20', value: savingsYear20, color: 'text-indigo-400' },
    { label: 'Année 25', value: savingsYear25, color: 'text-emerald-400' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 mt-4" data-testid="timeline">
      {points.map((p, i) => (
        <div key={i} className="bg-white/5 p-3 rounded-lg border border-white/5 text-center transition-all hover:bg-white/10 hover:scale-[1.02]">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-1 tracking-wider">{p.label}</p>
          <p className={`text-lg font-black ${p.color}`}>{formatCurrency(p.value)}</p>
        </div>
      ))}
    </div>
  );
};
