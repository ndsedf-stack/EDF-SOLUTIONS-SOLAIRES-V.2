import React from 'react';
import { seniorPhases } from './SeniorCoachPhases';

export const SeniorCoach = () => {
  return (
    <div className="p-4 bg-slate-900 text-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Coach Senior</h2>
      <div className="space-y-4">
        {seniorPhases.map(phase => (
          <div key={phase.id} className="p-3 bg-white/5 rounded border border-white/10">
            <h3 className="font-bold text-amber-400">Phase {phase.number}: {phase.title}</h3>
            <p className="text-sm text-slate-400">{phase.keyPhrase}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
