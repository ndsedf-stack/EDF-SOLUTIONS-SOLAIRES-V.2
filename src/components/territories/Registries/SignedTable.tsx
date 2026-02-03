
import React from 'react';
import { Study, Metrics, EmailLead, DashboardFilters } from '@/brain/types';
import { StudyCardPremium } from '@/components/dashboard/StudyCardPremium';

interface SignedStudiesProps {
  studies: Study[];
  metrics: Metrics;
  filters: DashboardFilters;
  antiAnnulationByStudy: Record<string, any>;
  postRefusByStudy: Record<string, any>;
  leads: EmailLead[];
  onSignStudy: (id: string, name: string) => void; 
  onMarkDepositPaid: (id: string, name: string) => void;
  onMarkRibSent: (id: string, name: string) => void;
  onCancelStudy: (id: string, name: string) => void;
  onDeleteStudy: (id: string, name: string) => void;
}

export const SignedStudies: React.FC<SignedStudiesProps> = ({
  studies,
  metrics,
  filters,
  antiAnnulationByStudy,
  postRefusByStudy,
  leads,
  onSignStudy, 
  onMarkDepositPaid,
  onMarkRibSent,
  onCancelStudy,
  onDeleteStudy,
}) => {
  // ✅ NOUVELLE APPROCHE : On montre TOUT ce qui est signé dans le Registre Axe A
  const signed = metrics.signed; 
  
  // Appliquer les filtres
  const filteredSigned = signed.filter((s) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (
        !s.name.toLowerCase().includes(search) &&
        !s.email.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    if (filters.views === "5+" && (s.views || 0) < 5) return false;
    if (filters.clicks === "1+" && (s.clicks || 0) < 1) return false;
    // status filtre ne s'applique pas vraiment ici car on est déjà dans les signés
    if (filters.optout && !s.email_optout) return false;

    return true;
  });

  // Trier par retard décroissant (avec Guyot en priorité absolue)
  const sortedArticles = filteredSigned.sort((a, b) => {
    if (a.name?.toUpperCase().includes("GUYOT")) return -1;
    if (b.name?.toUpperCase().includes("GUYOT")) return 1;
    const daysA = a.daysLate || 0;
    const daysB = b.daysLate || 0;
    return daysB - daysA;
  });

  // ✅ Calcul du vrai nombre de dossiers en attente d'acompte (Exclure 100% financé)
  const waitingDepositCount = sortedArticles.filter(
    (s) =>
      s.requiresDeposit &&
      !s.deposit_paid &&
      s.financing_mode !== "full_financing"
  ).length;

  return (
    <div id="late-deposits-section" className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">✅</span>
          <div>
            <h2 className="text-2xl font-black text-white">
              AXE A — DOSSIERS SIGNÉS (HISTORIQUE)
            </h2>
            <div className="text-sm text-slate-400">
              {sortedArticles.length} dossiers au total •{" "}
              <span className={`${waitingDepositCount > 0 ? 'text-red-400' : 'text-emerald-400'} font-bold`}>
                {waitingDepositCount} en attente d'acompte
              </span>
            </div>
          </div>
        </div>
      </div>

      {sortedArticles.length === 0 ? (
        <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl text-center">
          <div className="text-4xl mb-3">🎉</div>
          <div className="text-lg font-bold text-emerald-400">
            Tous les acomptes sont à jour !
          </div>
          <div className="text-sm text-slate-500 mt-2">
            Aucun retard hors War Room
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedArticles.map((study) => (
            <StudyCardPremium
              key={study.id}
              study={study}
              antiAnnulationByStudy={antiAnnulationByStudy}
              postRefusByStudy={postRefusByStudy}
              leads={leads}
              onMarkDepositPaid={onMarkDepositPaid}
              onMarkRibSent={onMarkRibSent}
              onCancelStudy={onCancelStudy}
              onDeleteStudy={onDeleteStudy}
            />
          ))}
        </div>
      )}
    </div>
  );
};
