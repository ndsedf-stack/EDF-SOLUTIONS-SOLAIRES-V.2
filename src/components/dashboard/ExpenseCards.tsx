import React from 'react';
import { formatCurrency } from '../../utils/finance';

interface Props {
  totalCost: number;
}

export const ExpenseCards: React.FC<Props> = ({ totalCost }) => {
  return (
    <div className="flex justify-center mb-8" data-testid="expense-cards">
      <div className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 w-full max-w-lg text-center shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:border-white/20 transition-all duration-500">
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">Investissement Total</p>
        <p className="text-4xl md:text-5xl font-black text-white tracking-tight">{formatCurrency(totalCost)}</p>
      </div>
    </div>
  );
};
