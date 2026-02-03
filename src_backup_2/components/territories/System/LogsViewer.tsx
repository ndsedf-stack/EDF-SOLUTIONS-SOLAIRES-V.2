
import React, { useState } from 'react';
import { DecisionLog } from '@/brain/types';
import { getTimeAgo } from '@/components/dashboard/utils';

interface LogsProps {
  logs: DecisionLog[];
  zenMode: boolean;
}

export const Logs: React.FC<LogsProps> = ({ logs, zenMode }) => {
  if (zenMode) return null; 

  const [expanded, setExpanded] = useState(false);
  const displayLogs = expanded ? logs : logs.slice(0, 10);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📜</span>
          <div>
            <h2 className="text-2xl font-black text-white">
              LOGS DE DÉCISIONS
            </h2>
            <div className="text-sm text-slate-400">
              {logs.length} action{logs.length > 1 ? "s" : ""} enregistrée
              {logs.length > 1 ? "s" : ""}
            </div>
          </div>
        </div>
        {logs.length > 10 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
          >
            {expanded ? "⬆️ Réduire" : `⬇️ Voir tous (${logs.length})`}
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl text-center">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-lg font-bold text-slate-400">
            Aucune action enregistrée
          </div>
          <div className="text-sm text-slate-500 mt-2">
            Les décisions apparaîtront ici
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {displayLogs.map((log) => {
            // Unused isRecent logic removed or fixed?
            // In original code:
            // const isRecent = new Date().getTime() - new Date(log.created_at).getTime(); 3600000;
            // It seems it was checking if < 1 hour (3600000ms).
            const isRecent = (new Date().getTime() - new Date(log.created_at).getTime()) < 3600000;

            return (
              <div
                key={log.id}
                className={`p-4 rounded-xl border transition-all ${
                  isRecent
                    ? "glass-panel bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                    : "glass-panel border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-white">
                        {log.client_name}
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs font-bold">
                        {log.action_performed}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">
                      {log.justification}
                    </p>
                    <div className="text-xs text-slate-500">
                      {getTimeAgo(log.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
