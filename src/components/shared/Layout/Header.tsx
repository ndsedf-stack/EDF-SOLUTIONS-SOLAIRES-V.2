
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
    <span>{label}</span>
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
    <header className="fixed top-4 left-4 right-4 z-50">
      <div className="glass-panel rounded-2xl px-4 py-2 border border-white/10 shadow-2xl relative overflow-hidden h-16 grid grid-cols-[1.2fr_auto_1fr] items-center">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        
        {/* SLOT LEFT: BRAND & VITAL METRICS */}
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
              <span className="text-xl">⚡</span>
            </div>
            <div className="hidden xl:block">
              <h1 className="text-base font-black text-white tracking-widest leading-none">
                AUTOPILOTE <span className="text-blue-400">SOLAIRE</span>
              </h1>
              <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-tight mt-1 truncate">
                Clients: {totalClients} <span className="mx-0.5 opacity-30">•</span> Dossiers: {totalStudies}
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-white/5 overflow-hidden whitespace-nowrap">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white">{conversionRate}%</span>
                <div className="w-8 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${conversionRate}%` }} />
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[9px] text-emerald-500/70 font-black uppercase leading-none">Signés</span>
              <span className="text-sm font-black text-emerald-400">{signedClients}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] text-red-500/70 font-black uppercase leading-none">Désab.</span>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-red-400">{unsubscribedCount}</span>
                <span className="text-[8px] text-red-500/40 font-bold">{unsubscribeRate.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center px-2">
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 shadow-inner backdrop-blur-md">
               <NavButton active={activeSection === "cockpit" || activeSection === "dashboard"} onClick={() => setActiveSection("cockpit")} icon="🛰️" label="Cockpit" />
               <NavButton active={activeSection === "war_room"} onClick={() => setActiveSection("war_room")} icon="⚔️" label="War Room" />
               <NavButton active={activeSection === "pilotage"} onClick={() => setActiveSection("pilotage")} icon="🧭" label="Pilotage" />
               <NavButton active={activeSection === "sales"} onClick={() => setActiveSection("sales")} icon="📈" label="Vente" />
               <NavButton active={activeSection === "roi"} onClick={() => setActiveSection("roi")} icon="💎" label="ROI" />
               <NavButton active={activeSection === "registry"} onClick={() => setActiveSection("registry")} icon="🗂️" label="Registre" />
            </div>
        </div>

        {/* SLOT RIGHT: SYSTEM TOOLS & USER */}
        <div className="flex items-center justify-end gap-2">
          {lastRefresh && (
            <div className="hidden min-[1600px]:flex items-center gap-2 px-2 py-1 rounded-lg bg-black/20 border border-white/5 whitespace-nowrap">
              <div className={`w-1.5 h-1.5 rounded-full ${statusColors[systemStatus] || statusColors.normal}`} />
              <div className="text-[9px] text-slate-500 font-mono font-bold">
                SYNC: {lastRefresh.toLocaleTimeString("fr-FR")}
              </div>
            </div>
          )}

          <button
            onClick={onRefresh}
            className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all active:scale-95 group border border-white/5"
          >
            <span className="text-xs group-hover:rotate-180 transition-transform duration-700">🔄</span>
          </button>

          <div className="h-4 w-px bg-white/10 mx-1"></div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onTogglePriorityMode}
              className={`h-8 px-2.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                priorityMode
                  ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20"
                  : "bg-white/5 text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>🔥</span>
              <span className="hidden sm:inline">Priorité</span>
            </button>

            <button
              onClick={onToggleZenMode}
              className={`h-8 px-2.5 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                zenMode
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                  : "bg-white/5 text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>🧘</span>
              <span className="hidden sm:inline">Zen</span>
            </button>
          </div>

          <button 
            onClick={() => navigate('/admin')}
            className="w-auto h-8 px-3 rounded-full border border-white/10 flex items-center justify-center bg-slate-900 ml-1 flex-shrink-0 hover:bg-slate-800 hover:border-orange-500/50 hover:text-orange-500 transition-all cursor-pointer group"
          >
             <span className="text-[10px] font-black text-slate-400 group-hover:text-orange-500 transition-colors">ADMIN</span>
          </button>
        </div>
      </div>
    </header>
  );
};
