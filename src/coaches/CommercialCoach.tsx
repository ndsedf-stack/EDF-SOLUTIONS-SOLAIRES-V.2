import React from 'react';
import { standardPhases } from './StandardCoachPhases'; // Assuming Standard = Commercial for now or using Standard phases

export const CommercialCoach = () => {
  return (
    <div className="p-4 bg-slate-900 text-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Coach Commercial</h2>
      <div className="space-y-4">
        {standardPhases.map(phase => (
          <div key={phase.id} className="p-3 bg-white/5 rounded border border-white/10">
            <h3 className="font-bold text-emerald-400">Phase {phase.number}: {phase.title}</h3>
            <p className="text-sm text-slate-400">{phase.keyPhrase}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
