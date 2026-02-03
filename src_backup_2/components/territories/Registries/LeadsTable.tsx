
import React, { useState } from 'react';
import { EmailLead, LeadFilters } from '@/brain/types';
import { EmailPressureVisx } from '../Pilotage/core/EmailPressureVisx';
import { getNextFollowup } from '@/components/dashboard/utils';

interface EmailLeadsProps {
  leads: EmailLead[];
  trafficData: any[]; 
  globalFilters?: { search: string }; // ✅ Ajout prop
  onSetOptOut: (email: string) => void;
  onDeleteLead: (clientId: string, email: string, name: string) => void;
}

export const EmailLeads: React.FC<EmailLeadsProps> = ({
  leads,
  trafficData,
  globalFilters, // ✅ Récupération
  onSetOptOut,
  onDeleteLead,
}) => {
  const [filters, setFilters] = useState<LeadFilters>({
    search: "",
    today: false,
    optedOut: false,
  });

  // Filtrage
  let filtered = leads.filter((l) => {
    // ✅ FUSION RECHERCHE GLOBALE + LOCALE
    const activeSearch = (globalFilters?.search || filters.search).toLowerCase();
    
    if (activeSearch) {
      if (
        !l.client_name.toLowerCase().includes(activeSearch) &&
        !l.client_email.toLowerCase().includes(activeSearch)
      ) {
        return false;
      }
    }
    if (filters.today && l.next_email_date) {
      const today = new Date().toDateString();
      const nextDate = new Date(l.next_email_date).toDateString();
      if (today !== nextDate) return false;
    }
    // ✅ FIX: "OptedOut" check logic corrected to match UI toggle intent
    if (filters.optedOut && !l.opted_out) return false;
    
    return true;
  });

  // Tri par prochaine relance
  filtered = filtered.sort((a, b) => {
    if (!a.next_email_date) return 1;
    if (!b.next_email_date) return -1;
    return (
      new Date(a.next_email_date).getTime() -
      new Date(b.next_email_date).getTime()
    );
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📧</span>
          <div>
            <h2 className="text-2xl font-black text-white">
              AXE C — LEADS EMAIL (AUTOMATISATION)
            </h2>
            <div className="text-sm text-slate-400">
              {filtered.length} lead{filtered.length > 1 ? "s" : ""} en
              nurturing
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 NOUVEAU : ANALYSE DE LA PRESSION EMAIL (DESIGN SOLAIRE) - AXE C */}
      <div className="mb-8">
        <EmailPressureVisx data={trafficData} />
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher un lead..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="flex-1 min-w-[200px] px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />

        <button
          onClick={() => setFilters({ ...filters, today: !filters.today })}
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.today
              ? "bg-green-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          📅 Aujourd'hui
        </button>

        <button
          onClick={() =>
            setFilters({ ...filters, optedOut: !filters.optedOut })
          }
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.optedOut
              ? "bg-red-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          🚫 Désabonnés
        </button>

        {(filters.search || filters.today || filters.optedOut) && (
          <button
            onClick={() =>
              setFilters({ search: "", today: false, optedOut: false })
            }
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
          >
            🔄 Reset
          </button>
        )}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-lg font-bold text-slate-400">
            Aucun lead trouvé
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => {
            const nextFollowup = getNextFollowup(lead);
            const isToday =
              lead.next_email_date &&
              new Date(lead.next_email_date).toDateString() ===
                new Date().toDateString();

            return (
              <div
                key={lead.id}
                className={`rounded-xl p-5 border-2 transition-all ${
                  lead.opted_out
                    ? "bg-red-500/10 border-red-500/50"
                    : isToday
                    ? "bg-green-500/10 border-green-500/50"
                    : "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70"
                }`}
              >
                <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr] gap-4 items-center">
                  {/* COLONNE 1 : Identité & Badges */}
                  <div>
                    <div className="mb-3">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="text-2xl font-black text-white uppercase tracking-tight leading-none">
                          {lead.client_name}
                        </div>
                      </div>
                      <div className="text-sm text-slate-400 font-medium ml-0.5">
                        {lead.client_email}
                      </div>
                    </div>

                    {/* Badges Container */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* BADGE SEQUENCE (Comme status axe A) */}
                      <span className="px-2 py-0.5 bg-blue-900/40 border border-blue-500/30 text-blue-300 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                        <span>🔄</span> ÉTAPE {lead.email_sequence_step}
                      </span>

                      {lead.opted_out && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-[10px] font-bold uppercase">
                          🚫 DÉSABONNÉ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* COLONNE 2 : Engagement (Matches Montant Col) */}
                  <div>
                    <div className="pl-4 border-l border-white/5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Engagement
                      </div>
                      <div className="flex items-end gap-3 mb-2">
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-white leading-none">
                            {lead.total_opens}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">
                            Ouvertures
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-white leading-none">
                            {lead.total_clicks}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase font-bold">
                            Clics
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COLONNE 3 : Timing (Matches Timeline Col) */}
                  <div>
                    <div className="pl-4 border-l border-white/5 space-y-2">
                      <div className="flex flex-col gap-1">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Prochaine relance
                        </div>
                        {(() => {
                          // Check if overdue
                          let isOverdue = false;
                          if (
                            nextFollowup !== "Immédiat" &&
                            nextFollowup !== "Terminé"
                          ) {
                            const [d, m, y] = nextFollowup.split("/");
                            if (d && m && y) {
                              const target = new Date(
                                parseInt(y),
                                parseInt(m) - 1,
                                parseInt(d)
                              );
                              const now = new Date();
                              now.setHours(0, 0, 0, 0);
                              if (target < now) isOverdue = true;
                            }
                          }

                          return (
                            <div
                              className={`text-sm font-bold ${
                                isOverdue
                                  ? "text-red-400 animate-pulse"
                                  : nextFollowup === "Immédiat" || isToday
                                  ? "text-green-400"
                                  : "text-white"
                              }`}
                            >
                              {isOverdue
                                ? `🔥 RETARD (${nextFollowup})`
                                : nextFollowup === "Immédiat"
                                ? "🔥 Immédiat"
                                : nextFollowup}
                            </div>
                          );
                        })()}
                      </div>

                      {lead.last_email_sent ? (
                        <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                          <span>📧</span> Email envoyé le{" "}
                          {new Date(lead.last_email_sent).toLocaleDateString(
                            "fr-FR"
                          )}
                        </div>
                      ) : (
                        <div className="text-[10px] font-medium text-slate-600 italic mt-1">
                          💤 Aucun envoi
                        </div>
                      )}
                    </div>
                  </div>

                  {/* COLONNE 4 : Actions */}
                  <div className="flex flex-col gap-2 pl-4 border-l border-transparent">
                    {!lead.opted_out && (
                      <button
                        onClick={() => {
                          if (confirm(`Désabonner ${lead.client_name} ?`)) {
                            onSetOptOut(lead.client_email);
                          }
                        }}
                        className="w-full h-10 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/30 rounded-lg font-bold text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-2"
                      >
                        🚫 Opt-out
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Supprimer définitivement ${lead.client_name} ?`
                          )
                        ) {
                          onDeleteLead(
                            lead.client_id,
                            lead.client_email,
                            lead.client_name
                          );
                        }
                      }}
                      className="w-full h-9 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all flex items-center justify-center gap-2"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
