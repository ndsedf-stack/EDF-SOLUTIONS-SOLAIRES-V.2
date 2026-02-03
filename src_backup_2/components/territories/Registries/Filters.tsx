
import React from 'react';
import { DashboardFilters } from '@/brain/types';

interface FiltersProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Recherche */}
      <input
        type="text"
        placeholder="🔍 Rechercher un client..."
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        className="flex-1 min-w-[200px] px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
      />

      {/* Filtres rapides */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() =>
            onFilterChange({
              ...filters,
              views: filters.views === "5+" ? null : "5+",
            })
          }
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.views === "5+"
              ? "bg-orange-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          👁️ Vues 5+
        </button>

        <button
          onClick={() =>
            onFilterChange({
              ...filters,
              clicks: filters.clicks === "1+" ? null : "1+",
            })
          }
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.clicks === "1+"
              ? "bg-green-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          🖱️ Clics 1+
        </button>

        <button
          onClick={() =>
            onFilterChange({
              ...filters,
              status: filters.status === "sent" ? null : "sent",
            })
          }
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.status === "sent"
              ? "bg-blue-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          📧 Envoyés
        </button>

        <button
          onClick={() =>
            onFilterChange({ ...filters, optout: !filters.optout })
          }
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
            filters.optout
              ? "bg-red-600 text-white shadow-lg"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700 border border-slate-700/30"
          }`}
        >
          🚫 Opt-out
        </button>
      </div>

      {/* Reset */}
      {(filters.search ||
        filters.views ||
        filters.clicks ||
        filters.status ||
        filters.optout) && (
        <button
          onClick={() =>
            onFilterChange({
              search: "",
              views: null,
              clicks: null,
              status: null,
              optout: false,
            })
          }
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-sm transition-colors"
        >
          🔄 Reset
        </button>
      )}
    </div>
  );
};
