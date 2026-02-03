import React from 'react';
import { ExecutionDesk } from './ExecutionDesk';
import { ActionZone } from './ActionZone';

interface WarRoomViewProps {
  system: any;
}

export const WarRoomView: React.FC<WarRoomViewProps> = ({ system }) => {
  const { 
    studies, 
    metrics, 
    emailLeads: leads,
    antiAnnulationByStudy,
    postRefusByStudy,
    actions: { markDepositPaid, markRibSent, signStudy, cancelStudy, deleteStudy },
  } = system;

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">⚔️</span>
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">War Room</h2>
          <div className="text-sm text-red-400 font-medium">Gestion des urgences et exécution prioritaire</div>
        </div>
      </div>

      {/* 1. EXECUTION DESK */}
      <ExecutionDesk
        show={true} // In War Room, we always show it or manage local state
        priority={system.metrics?.urgencyMode?.focus}
        onPrimaryAction={() => {
            if (system.metrics?.urgencyMode?.focus) alert(`Action lancée pour ${system.metrics?.urgencyMode?.focus.name}`);
        }}
        onScrollToWarRoom={() => {}} // Already here
      />

      {/* 2. ACTION ZONE */}
      <ActionZone
        studies={studies}
        metrics={metrics}
        antiAnnulationByStudy={antiAnnulationByStudy}
        postRefusByStudy={postRefusByStudy}
        leads={leads}
        onMarkDepositPaid={markDepositPaid}
        onMarkRibSent={markRibSent}
        onSignStudy={signStudy}
        onCancelStudy={cancelStudy}
        onDeleteStudy={deleteStudy}
      />

      <div className="bg-slate-800/20 rounded-xl p-8 border border-white/5 text-center">
        <p className="text-slate-500 text-sm italic">"Si c'est dans cette salle, c'est que c'est important."</p>
      </div>
    </div>
  );
};
