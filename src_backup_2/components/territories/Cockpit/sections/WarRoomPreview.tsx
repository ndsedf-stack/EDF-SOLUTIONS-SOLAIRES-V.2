import React from 'react';
import { ExecutionDesk } from '../../WarRoom/ExecutionDesk';

export const WarRoomPreview = ({ metrics }: { metrics: any }) => {
  const priorityStudy = metrics?.priorityCase || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="h-px flex-1 bg-white/5"></div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-red-500/40">S04 — WAR ROOM (MOMENTUM)</h2>
        <div className="h-px flex-1 bg-white/5"></div>
      </div>

      {priorityStudy ? (
        <ExecutionDesk 
          show={true}
          priority={priorityStudy}
          onPrimaryAction={() => console.log('Action recorded')}
          onScrollToWarRoom={() => {
            const btn = document.querySelector('button[icon="⚔️"]') as HTMLButtonElement;
            if (btn) btn.click();
          }}
        />
      ) : (
        <div className="bg-[#0F1629] p-16 rounded-3xl border border-white/[0.05] text-center">
            <p className="text-slate-500 font-black uppercase tracking-[0.4em] italic opacity-40">
              AUCUNE ALERTE CRITIQUE — SYSTÈME STABILISÉ
            </p>
        </div>
      )}
    </div>
  );
};
