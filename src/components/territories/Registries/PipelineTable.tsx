
import React from 'react';
import { Study, DashboardFilters, EmailLead } from '@/brain/types';
import { getLeadTemperature } from '@/brain/signals/mappers';
import { StudyCardPremium } from '@/components/dashboard/StudyCardPremium';

interface PipelineProps {
  studies: Study[];
  filters: DashboardFilters;
  emailFlowByClient: Record<string, any>;
  antiAnnulationByStudy: Record<string, any>;
  postRefusByStudy: Record<string, any>;
  leads: EmailLead[];
  onSignStudy: (id: string, name: string) => void;
  onCancelStudy: (id: string, name: string) => void;
  onDeleteStudy: (id: string, name: string) => void;
}

export const Pipeline: React.FC<PipelineProps> = ({
  studies,
  filters,
  emailFlowByClient,
  antiAnnulationByStudy,
  postRefusByStudy,
  leads,
  onSignStudy,
  onCancelStudy,
  onDeleteStudy,
}) => {
  // Filtrage
  let filtered = studies.filter((s) => {
    // AXE B : STRICTEMENT NON-SIGNÉ
    if (s.status === "signed") return false;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      const name = s.name?.toLowerCase() || "";
      const email = s.email?.toLowerCase() || "";
      
      if (!name.includes(search) && !email.includes(search)) {
        return false;
      }
    }
    if (filters.views === "5+" && s.views < 5) return false;
    if (filters.clicks === "1+" && s.clicks < 1) return false;
    if (filters.status && s.status !== filters.status) return false;
    if (filters.optout && !s.email_optout) return false;

    return true;
  });

  // Tri par température (HOT > WARM > COLD > SIGNED)
  filtered = filtered.sort((a, b) => {
    const tempOrder = { hot: 0, warm: 1, cold: 2, signed: 3 };
    const tempA = getLeadTemperature(a);
    const tempB = getLeadTemperature(b);
    return tempOrder[tempA] - tempOrder[tempB];
  });

  return (
    <div className="mb-8">
      {filtered.length === 0 ? (
        <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-lg font-bold text-slate-400">
            Aucun dossier trouvé
          </div>
          <div className="text-sm text-slate-500 mt-2">
            Ajustez vos filtres ou critères de recherche
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((study) => (
            <StudyCardPremium
              key={study.id}
              study={study}
              antiAnnulationByStudy={antiAnnulationByStudy}
              postRefusByStudy={postRefusByStudy}
              leads={leads}
              onSignStudy={onSignStudy}
              onCancelStudy={onCancelStudy}
              onDeleteStudy={onDeleteStudy}
            />
          ))}
        </div>
      )}
    </div>
  );
};
