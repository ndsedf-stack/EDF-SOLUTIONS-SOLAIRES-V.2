import { Info } from "lucide-react";
import { useState } from "react";

export function InfoBubble({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-block ml-2">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen(!open)}
        className="p-1 rounded-full border border-white/10 bg-black/40 hover:bg-black/70 transition"
      >
        <Info size={12} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute z-[999] top-full mt-2 right-0 w-72 bg-black/95 border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-xl">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </div>
          <div className="text-[16px] text-slate-200 leading-relaxed space-y-2">
            {children}
          </div>
        </div>
      )}
    </span>
  );
}
