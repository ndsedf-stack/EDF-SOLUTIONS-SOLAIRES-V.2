type ModuleTransitionProps = {
  label?: string;
  title: string;
  subtitle?: string;
};

export default function ModuleTransition({
  label,
  title,
  subtitle,
}: ModuleTransitionProps) {
  return (
    <div className="my-14 flex items-center justify-center">
      <div className="w-full max-w-3xl text-center px-6">
        {/* Ligne */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          {label && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">
              {label}
            </span>
          )}
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Texte */}
        <p className="text-lg md:text-xl font-black text-white italic leading-snug">
          {title}
        </p>

        {subtitle && (
          <p className="mt-2 text-[12px] text-slate-400 italic leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
