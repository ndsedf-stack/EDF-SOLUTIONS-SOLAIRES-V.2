import React from 'react';
import { Logs } from './LogsViewer';

interface SystemViewProps {
  system: any;
}

export const SystemView: React.FC<SystemViewProps> = ({ system }) => {
  const { logs, zenMode } = system;

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">⚙️</span>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Système & Logs</h2>
          <div className="text-sm text-slate-400 font-medium">Diagnostic, activités en temps réel et état du Brain</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
              <Logs logs={logs} zenMode={zenMode} />
          </div>
          
          <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                  <h3 className="text-blue-400 font-bold mb-4 uppercase text-xs tracking-widest">État du Cerveau</h3>
                  <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Version Architecture</span>
                          <span className="text-white font-mono">v2.0 (Cockpit)</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Mode Synchronisation</span>
                          <span className="text-emerald-400 font-mono">Real-time</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400">Latence Brain</span>
                          <span className="text-white font-mono">12ms</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
