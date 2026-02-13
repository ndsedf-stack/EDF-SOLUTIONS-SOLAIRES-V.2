
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
  globalDateFilter?: 'current_month' | 'all_time'; // Optional to avoid breaking tests/other uses
  onSetDateFilter?: (filter: 'current_month' | 'all_time') => void;
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
  globalDateFilter = 'current_month', // Default safe
  onSetDateFilter
}) => {
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
                REVENUE <span className="text-blue-400">SENTINEL</span>
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
          <div className="hidden md:flex bg-black/40 p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => onSetDateFilter?.("current_month")}
                className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
                  globalDateFilter === "current_month" 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Mois
              </button>
              <button
                onClick={() => onSetDateFilter?.("all_time")}
                className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
                  globalDateFilter === "all_time" 
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20" 
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                Tout
              </button>
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
