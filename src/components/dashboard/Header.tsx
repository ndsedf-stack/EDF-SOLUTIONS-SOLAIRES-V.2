import React from "react";

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
}

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
  onStatClick,
}) => {
  const getStatusColor = () => {
    switch (systemStatus) {
      case "critical":
        return "var(--signal-danger)";
      case "warning":
        return "var(--signal-warning)";
      case "active":
        return "var(--signal-safe)";
      default:
        return "var(--signal-info)";
    }
  };

  const getStatusLabel = () => {
    switch (systemStatus) {
      case "critical":
        return "CRITIQUE";
      case "warning":
        return "ATTENTION";
      case "active":
        return "ACTIF";
      default:
        return "NORMAL";
    }
  };

  const conversionRate =
    totalClients > 0 ? Math.round((signedClients / totalClients) * 100) : 0;

  return (
    <header className="fixed top-4 left-4 right-4 z-50 transition-all duration-500">
      <div className="glass-panel rounded-2xl px-6 py-4 flex items-center justify-between border border-white/10 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-1 ring-white/10">
              <span className="text-2xl filter drop-shadow-md">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                AUTOPILOTE <span className="text-blue-400">SOLAIRE</span>
              </h1>
              <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                <span>{totalClients} clients</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded">
                  {totalStudies} études
                </span>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 pl-6 border-l border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                Conversion
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-black text-white">
                  {conversionRate}%
                </span>
                <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    style={{ width: `${conversionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col ml-2">
              <span className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-wider font-mono">
                Signés
              </span>
              <span className="text-lg font-bold text-emerald-400">
                {signedClients}
              </span>
            </div>

            <div className="flex flex-col ml-6 pl-6 border-l border-white/5">
              <span className="text-[10px] text-red-500/70 font-bold uppercase tracking-wider font-mono">
                Désabonnés
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-400">
                  {unsubscribedCount}
                </span>
                <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-bold font-mono">
                  {unsubscribeRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {lastRefresh && (
            <div className="hidden lg:block text-xs text-slate-500 font-mono">
              SYNC: {lastRefresh.toLocaleTimeString("fr-FR")}
            </div>
          )}

          <button
            onClick={onRefresh}
            className="w-10 h-10 flex items-center justify-center glass-panel-hover rounded-xl text-slate-400 hover:text-white transition-all active:scale-95 group"
          >
            <span className="text-lg group-hover:rotate-180 transition-transform duration-700">
              🔄
            </span>
          </button>

          <div className="h-8 w-px bg-white/10 mx-2"></div>

          <button
            onClick={onTogglePriorityMode}
            className={`h-10 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
              priorityMode
                ? "bg-orange-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                : "bg-white/5 text-slate-400"
            }`}
          >
            <span className="text-lg">🔥</span>
            <span className="hidden md:inline">Priorité</span>
          </button>

          <button
            onClick={onToggleZenMode}
            className={`h-10 px-4 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 ${
              zenMode
                ? "bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                : "bg-white/5 text-slate-400"
            }`}
          >
            <span className="text-lg">🧘</span>
            <span className="hidden md:inline">Zen</span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-2">
            <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-br from-white/20 to-transparent">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-white overflow-hidden relative">
                ND
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
