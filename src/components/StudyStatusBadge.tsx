// ============================================
// STUDY STATUS BADGE
// ============================================
const StudyStatusBadge = ({ status }: { status: string | null }) => {
  const map: Record<string, { label: string; className: string }> = {
    draft: {
      label: "🟡 DRAFT",
      className: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    },
    sent: {
      label: "🔵 ENVOYÉ",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    signed: {
      label: "🟢 SIGNÉ",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    cancelled: {
      label: "🔴 ANNULÉ",
      className: "bg-red-500/15 text-red-400 border-red-500/30",
    },
  };

  const conf = map[status ?? ""] || {
    label: "⚪ INCONNU",
    className: "bg-slate-500/10 text-slate-300 border-slate-500/20",
  };

  return (
    <div
      className={`inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest border ${conf.className}`}
    >
      {conf.label}
    </div>
  );
};

export default StudyStatusBadge;
