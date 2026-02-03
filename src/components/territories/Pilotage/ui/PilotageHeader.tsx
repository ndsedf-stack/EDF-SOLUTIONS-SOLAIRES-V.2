import React from 'react';

interface PilotageHeaderProps {
  activeTab: 'overview' | 'drift' | 'pipeline' | 'projection' | 'warroom' | 'leads';
  onTabChange: (tab: 'overview' | 'drift' | 'pipeline' | 'projection' | 'warroom' | 'leads') => void;
  userAvatar?: string;
  onToggleZenMode?: () => void;
}

export const PilotageHeader: React.FC<PilotageHeaderProps> = ({ 
  activeTab, 
  onTabChange,
  onToggleZenMode 
}) => {
  const tabs = [
    { id: 'overview', label: "Verdict" },
    { id: 'drift', label: "Drift Client" },
    { id: 'pipeline', label: "Pipeline" },
    { id: 'leads', label: "Leads & ROI" },
    { id: 'warroom', label: "🔥 War Room" }
  ];

  return (
    <header className="h-20 w-full flex items-center justify-between border-b border-white/5 bg-[#0A0E27]/95 backdrop-blur-md sticky top-0 z-50 px-10">
      {/* LEFT: LOGO (AUTORITÉ) */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
            <span className="text-2xl grayscale brightness-125">⚡</span>
            <span className="font-manrope font-extrabold text-xl text-white tracking-tight uppercase">
                Autopilote <span className="text-[#38BDF8] opacity-80">Pilotage</span>
            </span>
        </div>
      </div>

      {/* CENTER: TABS (SOBRIÉTÉ) */}
      <nav className="hidden md:flex items-center gap-12">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`
              flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.2em] transition-all duration-300
              ${activeTab === tab.id 
                ? 'text-[#38BDF8] opacity-100' 
                : 'text-white/40 hover:text-white hover:opacity-100'}
            `}
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeTab === tab.id ? 'bg-[#38BDF8] scale-125 shadow-[0_0_8px_rgba(56,189,248,0.4)]' : 'bg-white/10 scale-100'}`} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* RIGHT: ACTIONS (EFFICIENCE) */}
      <div className="flex items-center gap-8">
        {onToggleZenMode && (
          <button 
            onClick={onToggleZenMode}
            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
          >
            <span className="text-sm">🧘</span>
            <span className="text-[11px] font-bold uppercase tracking-widest font-sans">Focus Mode</span>
          </button>
        )}
        <div className="h-10 w-10 rounded-xl border border-white/10 overflow-hidden bg-[#0F1629] flex items-center justify-center font-manrope">
            <span className="text-xs font-extrabold text-[#38BDF8]">AD</span>
        </div>
      </div>
    </header>
  );
};
