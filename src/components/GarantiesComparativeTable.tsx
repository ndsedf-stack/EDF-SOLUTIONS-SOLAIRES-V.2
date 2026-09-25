import React from "react";

export interface GarantiesComparativeTableProps {
  activeMode?: "performance" | "essential" | boolean;
  onSelectMode?: (mode: boolean) => void;
  interactive?: boolean;
}

export const GarantiesComparativeTable: React.FC<GarantiesComparativeTableProps> = ({
  activeMode = "performance",
  onSelectMode,
  interactive = false,
}) => {
  const isPerf = activeMode === "performance" || activeMode === true;

  const rows = [
    {
      category: "Onduleur centralisé",
      perfPrestation: "Matériel, main-d'œuvre et déplacement",
      perfDuration: "À vie",
      essPrestation: "Matériel, main-d'œuvre et déplacement",
      essDuration: "25 ans",
    },
    {
      category: "Structure assurant l'étanchéité",
      perfPrestation: "Matériel, main-d'œuvre et déplacement",
      perfDuration: "À vie",
      essPrestation: "Matériel, main-d'œuvre et déplacement",
      essDuration: "10 ans",
    },
    {
      category: "Modules photovoltaïques (si défaillance)",
      perfPrestation: "Matériel, main-d'œuvre et déplacement",
      perfDuration: "À vie",
      essPrestation: "Matériel",
      essDuration: "25 ans",
    },
    {
      category: "Modules photovoltaïques (si sous-performance)",
      perfPrestation: "Matériel",
      perfDuration: "30 ans",
      essPrestation: "Matériel",
      essDuration: "25 ans",
    },
  ];

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="min-w-[620px]">
        {/* EN-TÊTES DE COLONNES */}
        <div className="grid grid-cols-12 gap-3 mb-3 items-end">
          <div className="col-span-4 pb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Composants & Prestations
            </span>
          </div>

          {/* GROUPE PERFORMANCE */}
          <div
            onClick={() => interactive && onSelectMode && onSelectMode(true)}
            className={`col-span-4 text-center transition-all ${
              interactive ? "cursor-pointer group" : ""
            }`}
          >
            <div
              className={`py-2 px-3 rounded-2xl font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                isPerf
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white ring-2 ring-blue-400 shadow-blue-900/40"
                  : "bg-blue-950/30 text-blue-300 border border-blue-500/20 opacity-70 group-hover:opacity-100"
              }`}
            >
              <span>Performance</span>
              {isPerf && (
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase font-bold">
                  Inclus
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="border border-blue-500/30 rounded-xl py-1 px-2 text-[10px] font-bold text-blue-300 uppercase bg-blue-950/40">
                Prestations
              </div>
              <div className="border border-blue-500/30 rounded-xl py-1 px-2 text-[10px] font-bold text-blue-300 uppercase bg-blue-950/40">
                Durée
              </div>
            </div>
          </div>

          {/* GROUPE ESSENTIEL+ */}
          <div
            onClick={() => interactive && onSelectMode && onSelectMode(false)}
            className={`col-span-4 text-center transition-all ${
              interactive ? "cursor-pointer group" : ""
            }`}
          >
            <div
              className={`py-2 px-3 rounded-2xl font-black text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 ${
                !isPerf
                  ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white ring-2 ring-amber-400 shadow-amber-950/40"
                  : "bg-amber-950/30 text-amber-300 border border-amber-500/20 opacity-70 group-hover:opacity-100"
              }`}
            >
              <span>Essentiel+</span>
              {!isPerf && (
                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase font-bold">
                  Inclus
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="border border-amber-500/30 rounded-xl py-1 px-2 text-[10px] font-bold text-amber-300 uppercase bg-amber-950/40">
                Prestations
              </div>
              <div className="border border-amber-500/30 rounded-xl py-1 px-2 text-[10px] font-bold text-amber-300 uppercase bg-amber-950/40">
                Durée
              </div>
            </div>
          </div>
        </div>

        {/* LIGNES DU TABLEAU */}
        <div className="space-y-2.5">
          {rows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-stretch">
              {/* Catégorie */}
              <div className="col-span-4 bg-zinc-900/90 border border-white/10 rounded-2xl px-4 py-3 flex items-center shadow-sm">
                <span className="text-xs sm:text-sm font-bold text-white leading-tight">
                  {row.category}
                </span>
              </div>

              {/* Performance */}
              <div className="col-span-4 grid grid-cols-2 gap-2">
                <div
                  className={`rounded-2xl p-2.5 flex items-center justify-center text-center text-[11px] sm:text-xs font-medium leading-snug transition-all ${
                    isPerf
                      ? "bg-blue-500/15 border border-blue-500/40 text-blue-100 font-semibold"
                      : "bg-zinc-900/50 border border-white/5 text-slate-400"
                  }`}
                >
                  {row.perfPrestation}
                </div>
                <div
                  className={`rounded-2xl p-2.5 flex items-center justify-center text-center text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                    isPerf
                      ? "bg-blue-500/25 border border-blue-400 text-blue-200 shadow-sm"
                      : "bg-zinc-900/50 border border-white/5 text-slate-400 font-bold"
                  }`}
                >
                  {row.perfDuration}
                </div>
              </div>

              {/* Essentiel+ */}
              <div className="col-span-4 grid grid-cols-2 gap-2">
                <div
                  className={`rounded-2xl p-2.5 flex items-center justify-center text-center text-[11px] sm:text-xs font-medium leading-snug transition-all ${
                    !isPerf
                      ? "bg-amber-500/15 border border-amber-500/40 text-amber-100 font-semibold"
                      : "bg-zinc-900/50 border border-white/5 text-slate-400"
                  }`}
                >
                  {row.essPrestation}
                </div>
                <div
                  className={`rounded-2xl p-2.5 flex items-center justify-center text-center text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                    !isPerf
                      ? "bg-amber-500/25 border border-amber-400 text-amber-200 shadow-sm"
                      : "bg-zinc-900/50 border border-white/5 text-slate-400 font-bold"
                  }`}
                >
                  {row.essDuration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GarantiesComparativeTable;
