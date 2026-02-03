import { Check, AlertTriangle, XCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

export default function ValidationQualityPanel({ validation }) {
  const [open, setOpen] = useState(false);

  if (!validation) return null;

  const { score, isValid, errors, warnings, info } = validation;

  const color = !isValid
    ? "bg-red-600"
    : score >= 90
    ? "bg-green-600"
    : score >= 75
    ? "bg-yellow-500"
    : "bg-orange-500";

  return (
    <div className="mt-4 w-full rounded-xl bg-slate-900/60 border border-slate-700 text-white shadow-lg backdrop-blur p-4 relative">
      {/* HEADER */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${color}`}
          >
            {score}%
          </div>
          <span className="text-sm font-semibold">
            {isValid
              ? score >= 90
                ? "Projet validé 🎉"
                : "Projet acceptable ⚠️"
              : "Projet rejeté 🚨"}
          </span>
        </div>

        <ChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          size={20}
        />
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="mt-4 space-y-3">
          {/* ERRORS */}
          {errors?.length > 0 && (
            <div>
              <div className="font-bold text-red-400 flex items-center gap-2 mb-1">
                <XCircle size={16} /> Erreurs ({errors.length})
              </div>
              <ul className="text-sm text-red-300 space-y-1">
                {errors.map((e, idx) => (
                  <li key={"err-" + idx} className="flex justify-between">
                    <span>
                      {e.category}: {e.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* WARNINGS */}
          {warnings?.length > 0 && (
            <div>
              <div className="font-bold text-yellow-400 flex items-center gap-2 mb-1">
                <AlertTriangle size={16} /> Warnings ({warnings.length})
              </div>
              <ul className="text-sm text-yellow-300 space-y-1">
                {warnings.map((w, idx) => (
                  <li key={"warn-" + idx}>
                    {w.category}: {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* OK INFO */}
          {info?.length > 0 && (
            <div>
              <div className="font-bold text-green-400 flex items-center gap-2 mb-1">
                <Check size={16} /> Tests OK ({info.length})
              </div>
              <ul className="text-sm text-green-300 space-y-1 max-h-32 overflow-y-auto pr-2">
                {info.map((i, idx) => (
                  <li key={"ok-" + idx}>{i.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
