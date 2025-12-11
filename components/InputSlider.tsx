import React from 'react';

interface InputSliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  className?: string;
}

export const InputSlider: React.FC<InputSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-end">
        <label className="text-sm font-medium text-slate-600">{label}</label>
        <div className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-md min-w-[80px] text-right">
          {unit === '$' && '$'}
          {value.toLocaleString()}
          {unit === '%' && '%'}
          {unit === 'y' && ' Years'}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      />
    </div>
  );
};
