import React from 'react';

interface SliceRowProps {
  label: string;
  value: string;
  tone: 'info' | 'success' | 'warning' | 'danger';
}

export const SliceRow = ({ label, value, tone }: SliceRowProps) => {
  const colors = {
    info: 'text-[#00D9FF]',
    success: 'text-[#00E676]',
    danger: 'text-[#FF4757]',
    warning: 'text-[#FF9F40]',
  };
  return (
    <div className="flex flex-col mb-6 last:mb-0 border-b border-white/5 pb-4 last:border-0">
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1 font-mono">
        {label}
      </span>
      <div className={`text-2xl font-bold font-mono tracking-tight ${colors[tone]}`}>
        {value}
      </div>
    </div>
  );
};

interface SlicePanelProps {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const SlicePanel = ({ title, children, footer }: SlicePanelProps) => {
  return (
    <aside className="w-[320px] bg-[#0A0E1A] p-10 flex flex-col justify-center border-l border-white/5">
      <h3 className="text-[10px] font-mono text-white/20 tracking-[0.3em] uppercase mb-12 border-b border-white/5 pb-4">
        {title}
      </h3>
      
      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>

      {footer && (
        <div className="mt-auto pt-8 border-t border-white/5">
          {footer}
        </div>
      )}
    </aside>
  );
};

export const SliceDivider = () => <div className="my-8 h-px bg-white/5 w-full" />;

export const SliceHint = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white/5 rounded-lg p-4 border border-white/5">
    <p className="text-[11px] font-mono text-[#FF9F40] leading-relaxed">
      <span className="font-bold underline">HINT:</span> {children}
    </p>
  </div>
);
