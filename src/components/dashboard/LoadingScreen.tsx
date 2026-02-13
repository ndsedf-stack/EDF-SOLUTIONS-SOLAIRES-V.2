import React from "react";

interface LoadingScreenProps {
  progress: number;
  step: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  step,
}) => {
  const steps = [
    { id: 1, label: "Connexion", threshold: 15 },
    { id: 2, label: "Chargement", threshold: 35 },
    { id: 3, label: "Analyse", threshold: 60 },
    { id: 4, label: "Calcul", threshold: 85 },
  ];
  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex items-center justify-center overflow-hidden">
      <style>{`
  @keyframes scan-line {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }
  .scan-overlay {
    background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.1), transparent);
    animation: scan-line 3s linear infinite;
  }
`}</style>
      <div className="absolute inset-0 scan-overlay pointer-events-none"></div>
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-soft"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-soft" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 p-12 w-full max-w-3xl">
        {/* Logo Container */}
        <div className="relative">
          <div className="w-32 h-32 glass-panel rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.3)] bg-black/40 border border-white/10">
            <img 
               src="/img/revenue-sentinel-logo.png" 
               alt="Revenue Sentinel" 
               className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse-slow" 
            />
          </div>
          <div className="absolute inset-0 rounded-3xl border border-blue-500/30 animate-ping" style={{animationDuration: '3s'}}></div>
        </div>

        {/* Titre */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tight neon-text-blue flex items-center gap-3">
             REVENUE <span className="text-blue-500">SENTINEL</span>
          </h1>
          <div className="text-sm text-slate-400 uppercase tracking-[0.3em] font-mono">
            Initialisation du Système
          </div>
        </div>

        {/* Barre de progression Centrale */}
        <div className="w-full max-w-md space-y-4">
          <div className="flex justify-between items-end">
            <span className="text-blue-400 font-mono text-xs">{step}</span>
            <span className="text-2xl font-bold font-mono text-white">{progress}%</span>
          </div>
          
          <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(59,130,246,0.6)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Étapes Grid */}
        <div className="grid grid-cols-4 gap-4 w-full">
          {steps.map((s) => {
            const isActive = progress >= s.threshold;
            return (
              <div
                key={s.id}
                className={`
                  relative flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-500
                  ${isActive 
                    ? "bg-blue-900/20 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                    : "bg-slate-900/20 border-white/5 text-slate-600"}
                `}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono border
                  ${isActive 
                    ? "bg-blue-500 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    : "bg-slate-800 border-slate-700 text-slate-500"}
                `}>
                  {isActive ? "✓" : s.id}
                </div>
                <div className={`
                  text-xs font-bold uppercase tracking-wider
                  ${isActive ? "text-blue-300" : "text-slate-600"}
                `}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
