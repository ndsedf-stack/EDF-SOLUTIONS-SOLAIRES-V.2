import React from 'react';
import { SystemState } from '@/brain/useSystemBrain';

interface CockpitHelperProps {
  system: SystemState;
}

export const CockpitHelper: React.FC<CockpitHelperProps> = ({ system }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-4">🤖 Cockpit & AI Assistant</h2>
      <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700 text-center">
        <p className="text-slate-400">Territory Shell Ready</p>
        <p className="text-xs text-slate-500 mt-2">Will contain: AI Chat, Quick Actions, Contextual Help</p>
      </div>
    </div>
  );
};
