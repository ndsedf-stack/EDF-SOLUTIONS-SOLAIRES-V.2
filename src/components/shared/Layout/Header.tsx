
import React from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  zenMode: boolean;
  priorityMode: boolean;
  onToggleZenMode: () => void;
  onTogglePriorityMode: () => void;
  onRefresh: () => void;
  lastRefresh?: Date;
  systemStatus?: "normal" | "active" | "warning" | "critical";
  totalStudies?: number;
  totalClients?: number;
  signedClients?: number;
  onStatClick?: (type: string) => void;
  unsubscribedCount?: number;
  unsubscribeRate?: number;
  activeSection: "dashboard" | "cockpit" | "leads" | "war_room" | "pilotage" | "registry" | "sales" | "roi";
  setActiveSection: (section: "dashboard" | "cockpit" | "leads" | "war_room" | "pilotage" | "registry" | "sales" | "roi") => void;
  globalDateFilter?: string; 
  onSetDateFilter?: (filter: string) => void;
  availableMonths?: string[];
}

// ✅ NavButton Component
interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
      ${active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25" 
        : "text-slate-400 hover:text-white hover:bg-white/5"}
    `}
  >
    <span>{icon}</span>
    <span className="hidden md:inline">{label}</span>
  </button>
);

export const Header: React.FC<HeaderProps> = ({
  zenMode,
  priorityMode,
  onToggleZenMode,
  onTogglePriorityMode,
  onRefresh,
  lastRefresh,
  systemStatus = "normal",
  totalStudies = 0,
  totalClients = 0,
  signedClients = 0,
  unsubscribedCount = 0,
  unsubscribeRate = 0,
  activeSection,
  setActiveSection,
  globalDateFilter = 'all_time',
  onSetDateFilter,
  availableMonths = []
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const [rangeStart, setRangeStart] = React.useState('');
  const [rangeEnd, setRangeEnd] = React.useState('');

  React.useEffect(() => {
    if (availableMonths && availableMonths.length > 0) {
      if (!rangeStart) setRangeStart(availableMonths[availableMonths.length - 1]);
      if (!rangeEnd) setRangeEnd(availableMonths[0]);
    }
  }, [availableMonths]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatMonthLabel = (ymStr: string) => {
    if (!ymStr) return '';
    const [year, month] = ymStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    if (isNaN(date.getTime())) return ymStr;
    const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
  };

  const getFilterLabel = () => {
    if (globalDateFilter === 'all_time') return 'Tout';
    if (globalDateFilter === 'current_month') return 'Ce mois';
    if (globalDateFilter?.startsWith('range:')) {
      const parts = globalDateFilter.split(':');
      if (parts.length === 3) {
        const start = formatMonthLabel(parts[1]);
        const end = formatMonthLabel(parts[2]);
        return `${start} - ${end}`;
      }
    }
    return formatMonthLabel(globalDateFilter || '');
  };
  const conversionRate =
    totalClients > 0 ? Math.round((signedClients / totalClients) * 100) : 0;

  const statusColors = {
    normal: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    active: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]",
    warning: "bg-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse",
    critical: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-ping"
  };

  const navigate = useNavigate();

  return (
    <header className="fixed top-2 left-2 right-2 z-50">
      <div className="glass-panel rounded-2xl px-2 md:px-4 h-14 border border-white/10 shadow-2xl relative overflow-visible flex items-center justify-between gap-4 bg-[#050505]/95">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        
        {/* SLOT LEFT: BRAND & VITAL METRICS */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* LOGO REVENUE SENTINEL - NEW SHIELD BADGE */}
            <div className="w-14 h-14 flex items-center justify-center -my-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">
               <img src="/img/revenue-sentinel-logo.png" alt="Revenue Sentinel" className="w-full h-full object-contain transform hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="hidden xl:block ml-1">
              <h1 className="text-base font-black text-white tracking-widest leading-none whitespace-nowrap">
                REVENUE <span className="text-orange-500">SENTINEL</span>
              </h1>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-tight mt-0.5 truncate">
                Clients: {totalClients} <span className="mx-0.5 opacity-30">•</span> Dossiers: {totalStudies}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-white/5 overflow-hidden whitespace-nowrap">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">{conversionRate}%</span>
                <div className="w-6 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${conversionRate}%` }} />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[8px] text-emerald-500/70 font-black uppercase leading-none">Signés</span>
              <span className="text-xs font-black text-emerald-400">{signedClients}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[8px] text-red-500/70 font-black uppercase leading-none">Désab.</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-red-400">{unsubscribedCount}</span>
                <span className="text-[8px] text-red-500/40 font-bold">{unsubscribeRate.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER NAV - COMPACT */}
        <div className="flex justify-center flex-1 min-w-0 overflow-x-auto no-scrollbar px-2">
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner backdrop-blur-md whitespace-nowrap">
               <NavButton active={activeSection === "cockpit" || activeSection === "dashboard"} onClick={() => setActiveSection("cockpit")} icon="🛰️" label="Cockpit" />
               <NavButton active={activeSection === "war_room"} onClick={() => setActiveSection("war_room")} icon="⚔️" label="War Room" />
               <NavButton active={activeSection === "pilotage"} onClick={() => setActiveSection("pilotage")} icon="🧭" label="Pilotage" />
               <NavButton active={activeSection === "sales"} onClick={() => setActiveSection("sales")} icon="📈" label="Vente" />
               <NavButton active={activeSection === "roi"} onClick={() => setActiveSection("roi")} icon="💎" label="ROI" />
               <NavButton active={activeSection === "registry"} onClick={() => setActiveSection("registry")} icon="🗂️" label="Registre" />
            </div>
        </div>

          {/* SYSTEM TOOLS - RIGHT (Condensed) */}
          <div className="flex items-center justify-end gap-2 flex-shrink-0">
           {lastRefresh && (
            <div className="hidden 2xl:flex items-center gap-2 px-2 py-1 rounded-lg bg-black/20 border border-white/5 whitespace-nowrap">
              <div className={`w-1.5 h-1.5 rounded-full ${statusColors[systemStatus] || statusColors.normal}`} />
              <div className="text-[9px] text-slate-500 font-mono font-bold">
                {lastRefresh.toLocaleTimeString("fr-FR", {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          )}

          {/* DATE FILTER */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20 transition-all text-[9px] font-black uppercase tracking-wider text-slate-300"
            >
              <span>📅</span>
              <span>{getFilterLabel()}</span>
              <span className="text-[7px] text-slate-500">▼</span>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#090b11]/95 border border-white/10 rounded-xl p-4 shadow-2xl z-50 text-[11px] backdrop-blur-xl space-y-4 text-slate-300">
                {/* 1. SHORTCUTS */}
                <div className="space-y-2">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Raccourcis</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onSetDateFilter?.("all_time");
                        setIsOpen(false);
                      }}
                      className={`flex-1 py-1.5 rounded-md font-bold text-center border transition-all ${
                        globalDateFilter === "all_time"
                          ? "bg-violet-600 border-violet-500 text-white"
                          : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Tout le temps
                    </button>
                    <button
                      onClick={() => {
                        onSetDateFilter?.("current_month");
                        setIsOpen(false);
                      }}
                      className={`flex-1 py-1.5 rounded-md font-bold text-center border transition-all ${
                        globalDateFilter === "current_month"
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "bg-white/5 border-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      Mois en cours
                    </button>
                  </div>
                </div>

                <div className="h-px bg-white/5"></div>

                {/* 2. DYNAMIC MONTHS */}
                {availableMonths && availableMonths.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Mois spécifiques</div>
                    <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                      {availableMonths.map((ym) => (
                        <button
                          key={ym}
                          onClick={() => {
                            onSetDateFilter?.(ym);
                            setIsOpen(false);
                          }}
                          className={`py-1 rounded px-2 font-medium text-left border transition-all truncate ${
                            globalDateFilter === ym
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-black/20 border-white/5 hover:bg-white/5 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {formatMonthLabel(ym)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-px bg-white/5"></div>

                {/* 3. MONTH RANGE */}
                <div className="space-y-2">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sélection de période</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="text-[8px] text-slate-500 uppercase">Début</div>
                      <select
                        value={rangeStart}
                        onChange={(e) => setRangeStart(e.target.value)}
                        className="w-full bg-[#030408]/90 border border-white/10 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        {(availableMonths || []).map((ym) => (
                          <option key={ym} value={ym}>
                            {formatMonthLabel(ym)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-slate-600 self-end mb-1">à</div>
                    <div className="flex-1 space-y-1">
                      <div className="text-[8px] text-slate-500 uppercase">Fin</div>
                      <select
                        value={rangeEnd}
                        onChange={(e) => setRangeEnd(e.target.value)}
                        className="w-full bg-[#030408]/90 border border-white/10 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-blue-500"
                      >
                        {(availableMonths || []).map((ym) => (
                          <option key={ym} value={ym}>
                            {formatMonthLabel(ym)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (rangeStart && rangeEnd) {
                        const start = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
                        const end = rangeStart <= rangeEnd ? rangeEnd : rangeStart;
                        onSetDateFilter?.(`range:${start}:${end}`);
                        setIsOpen(false);
                      }
                    }}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all text-center mt-2 shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                  >
                    Valider la période
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:block h-4 w-px bg-white/10 mx-1"></div>

          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={onTogglePriorityMode}
              className={`h-7 px-2 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                priorityMode
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                  : "bg-white/5 text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>🔥</span>
            </button>

            <button
              onClick={onToggleZenMode}
              className={`h-7 px-2 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                zenMode
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                  : "bg-white/5 text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>🧘</span>
            </button>
          </div>

          <button 
            onClick={() => navigate('/admin')}
            className="w-auto h-7 px-2 rounded-full border border-white/10 flex items-center justify-center bg-slate-900 ml-1 hover:bg-slate-800 hover:border-orange-500/50 hover:text-orange-500 transition-all cursor-pointer group"
          >
             <span className="text-[9px] font-black text-slate-400 group-hover:text-orange-500 transition-colors">ADMIN</span>
          </button>
        </div>
      </div>
    </header>
  );
};
