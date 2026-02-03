import React from 'react';
import { NextActionIndicator } from './NextActionIndicator';
import { SystemState } from './SystemState';
import { CommercialActivityView } from './CommercialActivityView';
import { HumanROIView } from './HumanROIView';
import { ExecutionDesk } from '../WarRoom/ExecutionDesk';
import { calculateSystemMetrics } from '@/brain/intelligence/stats';

interface CockpitViewProps {
  system: any; 
}

export const CockpitView: React.FC<CockpitViewProps> = ({ system }) => {
  const { metrics, studies, emailLeads, actions, setActiveSection } = system;
  const stats = calculateSystemMetrics(studies, emailLeads, metrics);

  // S04 - WAR ROOM / EXECUTION DESK (Priorité du jour)
  const priorityStudy = metrics?.topUrgencyCases?.[0] || null;

  return (
    <div className="space-y-16 pb-20">
      
      {/* S01 — VERDICT GLOBAL */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
            <div className="h-px flex-1 bg-white/5"></div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">S01 — VERDICT GLOBAL</h2>
            <div className="h-px flex-1 bg-white/5"></div>
        </div>
        
        {metrics?.urgencyMode?.active && (
          <NextActionIndicator metrics={metrics} />
        )}

        <SystemState
          {...stats}
          onStatClick={(type: string) => {
              if (type === 'revenue') setActiveSection('pilotage');
              else setActiveSection('registry');
          }}
        />
      </div>

      {/* S02 — ACTIVITÉ & PERFORMANCE 🔥 */}
      <CommercialActivityView system={system} />

      {/* S03 — ROI HUMAIN */}
      <HumanROIView system={system} />

      {/* S04 — WAR ROOM / RISQUE */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
            <div className="h-px flex-1 bg-white/5"></div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">S04 — WAR ROOM (MOMENTUM)</h2>
            <div className="h-px flex-1 bg-white/5"></div>
        </div>

        {priorityStudy ? (
           <ExecutionDesk 
            show={true}
            priority={priorityStudy}
            onPrimaryAction={() => console.log('Action on', priorityStudy.name)}
            onScrollToWarRoom={() => setActiveSection('war_room')}
           />
        ) : (
          <div className="p-10 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
            <p className="text-slate-500 font-medium italic">Aucune alerte critique en attente. Système stabilisé.</p>
          </div>
        )}
      </div>

      {/* HUD NAVIGATION COMPACT */}
      <div className="flex justify-center mt-8">
        <div className="inline-flex items-center gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-xl backdrop-blur-sm shadow-2xl">
            <NavPill label="DÉTAILLER LE RISQUE" icon="⚔️" color="red" onClick={() => setActiveSection('war_room')} />
            <NavPill label="ANALYSE PILOTAGE" icon="✈️" color="indigo" onClick={() => setActiveSection('pilotage')} />
            <NavPill label="REGISTRE CLIENTS" icon="🗂️" color="emerald" onClick={() => setActiveSection('registry')} />
        </div>
      </div>
    </div>
  );
};

// Helper interne pour NavPill
const NavPill = ({ label, icon, color, onClick }: any) => {
    const colorClasses: any = {
        red: "hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30",
        indigo: "hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30",
        emerald: "hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30",
    };

    return (
        <button 
            onClick={onClick}
            className={`
                px-4 py-2 rounded-lg border border-transparent 
                flex items-center gap-2 text-[10px] font-black text-slate-500 
                transition-all duration-200 uppercase tracking-widest
                ${colorClasses[color]}
            `}
        >
            <span className="text-base">{icon}</span>
            <span>{label}</span>
        </button>
    );
};
