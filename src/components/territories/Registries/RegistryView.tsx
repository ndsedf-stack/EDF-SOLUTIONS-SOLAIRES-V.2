import React, { useState } from 'react';
import { Filters } from './Filters';
import { Pipeline } from './PipelineTable';
import { SignedStudies } from './SignedTable';
import { EmailLeads } from './LeadsTable';
import { DashboardFilters } from '@/brain/types';

interface RegistryViewProps {
  system: any;
}

export const RegistryView: React.FC<RegistryViewProps> = ({ system }) => {
  const { 
    studies, 
    metrics, 
    emailLeads, 
    trafficData,
    antiAnnulationByStudy,
    postRefusByStudy,
    emailFlowByClient,
    actions: { signStudy, cancelStudy, deleteStudy, markDepositPaid, markRibSent, setOptOut, deleteLeadPermanently }
  } = system;

  const [filters, setFilters] = useState<DashboardFilters>({
    search: "",
    views: null,
    clicks: null,
    status: null,
    optout: false,
  });

  const [hideSignedInPipeline, setHideSignedInPipeline] = useState(false);

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🗄️</span>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Registres & Data</h2>
            <div className="text-sm text-emerald-400 font-medium">Historique complet et gestion du pipeline</div>
          </div>
        </div>
        
        <button
            onClick={() => setHideSignedInPipeline(!hideSignedInPipeline)} 
            className={`px-4 py-2 rounded-lg border text-xs font-bold uppercase transition-all ${hideSignedInPipeline 
              ? 'bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-600' 
              : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'}`}
        >
            {hideSignedInPipeline ? 'Voir Signés' : 'Masquer Signés'}
        </button>
      </div>
      
      <Filters filters={filters} onFilterChange={setFilters} />

      {/* AXE A - SIGNED */}
      <SignedStudies
          studies={studies}
          metrics={metrics}
          filters={filters}
          antiAnnulationByStudy={antiAnnulationByStudy}
          postRefusByStudy={postRefusByStudy}
          leads={emailLeads}
          onSignStudy={signStudy}
          onMarkDepositPaid={markDepositPaid}
          onMarkRibSent={markRibSent}
          onCancelStudy={cancelStudy}
          onDeleteStudy={deleteStudy}
      />

      {/* AXE B - PIPELINE */}
      <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🚀</span>
              <div>
                  <h2 className="text-2xl font-black text-white">AXE B — PIPELINE (WARM & HOT)</h2>
                  <div className="text-sm text-slate-400">Focus: Conversion & Momentum</div>
              </div>
          </div>
          <Pipeline
              studies={studies}
              filters={filters}
              hideSignedInPipeline={hideSignedInPipeline}
              emailFlowByClient={emailFlowByClient}
              antiAnnulationByStudy={antiAnnulationByStudy}
              postRefusByStudy={postRefusByStudy}
              leads={emailLeads}
              onSignStudy={signStudy}
              onCancelStudy={cancelStudy}
              onDeleteStudy={deleteStudy}
          />
      </div>

      {/* AXE C - EMAIL LEADS */}
      <div className="mt-16">
          <EmailLeads
              leads={emailLeads.filter((l: any) => !studies.some((s: any) => s.client_id === l.client_id))} // ✅ FIX: Exclude converted studies from Leads Axis
              trafficData={trafficData}
              globalFilters={filters}
              onSetOptOut={setOptOut}
              onDeleteLead={deleteLeadPermanently}
          />
      </div>
    </div>
  );
};
