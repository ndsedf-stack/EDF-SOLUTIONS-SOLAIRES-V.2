import React, { useState, useEffect } from 'react';

/**
 * 🔮 PROJECTION CA — VERSION PREMIUM
 * Design: Financial Terminal / War Room Aesthetic
 * Doctrine: Vérité brutale, visuellement magnétique
 */

interface RevenueProjectionProps {
  current: number;
  target: number;
  gap: number;
  weeklyRunRate: number;
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR', 
    maximumFractionDigits: 0 
  }).format(val);

export const RevenueProjection: React.FC<RevenueProjectionProps> = ({
  current,
  target,
  gap,
  weeklyRunRate
}) => {
  const isGapNegative = gap < 0;
  const progressPercent = (current / target) * 100;
  const weeksToTarget = gap > 0 ? Math.ceil(gap / weeklyRunRate) : 0;
  const velocityNeeded = gap > 0 ? ((gap / weeklyRunRate / 12) * 100).toFixed(0) : 0;

  // Animation counter pour les chiffres
  const [animatedCurrent, setAnimatedCurrent] = useState(0);
  const [animatedTarget, setAnimatedTarget] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const incrementCurrent = current / steps;
    const incrementTarget = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setAnimatedCurrent(Math.min(incrementCurrent * step, current));
      setAnimatedTarget(Math.min(incrementTarget * step, target));
      
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [current, target]);

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#050814] via-[#0A0E27] to-[#0F1629] text-white overflow-hidden">
      
      {/* Grain texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
             backgroundRepeat: 'repeat',
           }} />

      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" 
           style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" 
           style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-[140px] animate-pulse" 
           style={{ animationDuration: '15s', animationDelay: '5s' }} />

      <div className="relative z-10 p-12 lg:p-16 flex flex-col gap-16">
        
        {/* Header avec effet glitch subtil */}
        <header className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-1 h-16 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 rounded-full 
                            shadow-[0_0_20px_rgba(6,182,212,0.5)] animate-pulse" />
            <div>
              <h1 className="text-5xl lg:text-6xl font-black uppercase tracking-tight"
                  style={{ 
                    fontFamily: '"Bebas Neue", "Impact", sans-serif',
                    textShadow: '0 0 30px rgba(6,182,212,0.3)',
                  }}>
                Projection Revenue
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs uppercase tracking-[0.3em] text-white/30 font-bold">
                  Anticipation 90 Jours
                </span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" />
                  <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-1 rounded-full bg-cyan-400 animate-ping" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Progress bar hero */}
        <div className="relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 
                        shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
             style={{ 
               backdropFilter: 'blur(10px)',
             }}>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 
                          transition-all duration-[2000ms] ease-out rounded-full
                          shadow-[0_0_20px_rgba(6,182,212,0.6)]"
               style={{ 
                 width: `${Math.min(progressPercent, 100)}%`,
                 animation: 'shimmer 3s infinite',
               }} />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black tracking-wider"
               style={{ 
                 textShadow: '0 0 10px rgba(0,0,0,0.8)',
                 fontFamily: '"JetBrains Mono", monospace',
               }}>
            {progressPercent.toFixed(1)}%
          </div>
        </div>

        {/* Hero metrics grid — REDESIGNED */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn"
             style={{ animationDelay: '0.2s' }}>
          
          {/* Sécurisé Actuel — LARGE CARD */}
          <div className="relative group lg:col-span-1 overflow-hidden rounded-3xl border border-white/10 
                          bg-gradient-to-br from-emerald-950/30 to-emerald-900/10 
                          hover:border-emerald-400/30 transition-all duration-500
                          shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent opacity-0 
                            group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] 
                            group-hover:blur-[80px] transition-all duration-700" />
            
            <div className="relative p-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-black tracking-[0.4em] text-emerald-400/60">
                  Sécurisé Actuel
                </span>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse 
                                  shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Live</span>
                </div>
              </div>
              
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-black tracking-tighter text-white"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {Math.round(animatedCurrent / 1000)}
                </span>
                <span className="text-4xl font-black text-emerald-400 italic">K€</span>
              </div>
              
              <div className="h-px bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0" />
              
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span>Rythme actuel</span>
                <span className="font-mono font-bold text-white">{formatCurrency(weeklyRunRate)}</span>
                <span className="text-white/30">/semaine</span>
              </div>
            </div>
          </div>

          {/* Objectif Target — LARGE CARD */}
          <div className="relative group overflow-hidden rounded-3xl border border-white/10 
                          bg-gradient-to-br from-cyan-950/30 to-cyan-900/10
                          hover:border-cyan-400/30 transition-all duration-500
                          shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent opacity-0 
                            group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]
                            group-hover:blur-[80px] transition-all duration-700" />
            
            <div className="relative p-10 flex flex-col gap-6">
              <span className="text-xs uppercase font-black tracking-[0.4em] text-cyan-400/60">
                Objectif 90J
              </span>
              
              <div className="flex items-baseline gap-3">
                <span className="text-7xl font-black tracking-tighter text-white"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {Math.round(animatedTarget / 1000)}
                </span>
                <span className="text-4xl font-black text-cyan-400 italic">K€</span>
              </div>
              
              <div className="h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0" />
              
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span>Progression</span>
                <span className="font-mono font-bold text-white">{progressPercent.toFixed(0)}%</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full 
                                  transition-all duration-1000"
                       style={{ width: `${Math.min(progressPercent, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gap & Velocity — COMPACT ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn"
             style={{ animationDelay: '0.4s' }}>
          
          {/* Écart / Gap */}
          <div className={`relative overflow-hidden rounded-2xl border p-8
                          ${isGapNegative 
                            ? 'bg-gradient-to-br from-red-950/30 to-red-900/10 border-red-500/20' 
                            : 'bg-gradient-to-br from-amber-950/30 to-amber-900/10 border-amber-500/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-black tracking-[0.3em] text-white/40">
                Écart (Gap)
              </span>
              {isGapNegative && (
                <div className="px-2 py-1 rounded-lg bg-red-500/20 border border-red-500/30">
                  <span className="text-[10px] font-bold text-red-400 uppercase">Critique</span>
                </div>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-black tracking-tighter ${isGapNegative ? 'text-red-400' : 'text-amber-400'}`}
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {isGapNegative ? '-' : '+'}{Math.abs(Math.round(gap / 1000))}
              </span>
              <span className="text-2xl font-black text-white/40 italic">K€</span>
            </div>
          </div>

          {/* Semaines restantes */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 
                          bg-gradient-to-br from-purple-950/30 to-purple-900/10 p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-black tracking-[0.3em] text-white/40">
                Temps Restant
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter text-purple-400"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {weeksToTarget}
              </span>
              <span className="text-2xl font-black text-white/40 italic">semaines</span>
            </div>
          </div>
        </div>

        {/* Strategic Context — PREMIUM CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fadeIn"
             style={{ animationDelay: '0.6s' }}>
          
          {/* Quote card — DOMINANT */}
          <div className="lg:col-span-3 relative overflow-hidden rounded-3xl border border-red-500/20 
                          bg-gradient-to-br from-red-950/40 via-red-900/20 to-transparent
                          shadow-[0_8px_32px_rgba(239,68,68,0.2)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.1),transparent_50%)]" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 via-red-400 to-red-600 
                            shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
            
            <div className="relative p-10 lg:p-12 flex flex-col gap-8">
              <div className="text-8xl text-red-500/10 font-serif leading-none">"</div>
              
              <p className="text-2xl lg:text-3xl text-white/90 leading-relaxed font-light italic -mt-16"
                 style={{ fontFamily: '"Playfair Display", serif' }}>
                Le futur n'est jamais une ligne droite.<br />
                Il est le produit de l'<span className="font-bold text-white">intensité actuelle</span>.
              </p>
              
              <div className="h-px bg-gradient-to-r from-red-500/0 via-red-500/30 to-red-500/0" />
              
              <p className="text-sm text-white/50 leading-relaxed">
                Au rythme actuel de <span className="font-mono font-bold text-white">{formatCurrency(weeklyRunRate)}</span>/semaine,
                l'objectif sera atteint dans <span className="font-bold text-red-400">{weeksToTarget} semaines</span>
                {weeksToTarget > 12 && (
                  <span className="text-red-400"> — soit un retard de {weeksToTarget - 12} semaines</span>
                )}.
              </p>
            </div>
          </div>

          {/* Action Required — COMPACT */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-white/10 
                          bg-gradient-to-br from-white/5 to-white/[0.02]
                          shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.1),transparent_70%)]" />
            
            <div className="relative p-8 lg:p-10 flex flex-col gap-6 h-full">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse 
                                shadow-[0_0_15px_rgba(251,191,36,0.8)]" />
                <span className="text-xs uppercase font-black tracking-[0.3em] text-amber-400/80">
                  Action Requise
                </span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="text-7xl font-black text-white"
                     style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  +{velocityNeeded}%
                </div>
                
                <p className="text-sm text-white/60 leading-relaxed">
                  Augmentation de vélocité commerciale nécessaire pour atteindre l'objectif 
                  avant la clôture du trimestre.
                </p>
              </div>
              
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Calculé en temps réel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes pour animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@700;900&family=Playfair+Display:ital,wght@0,400;1,700&display=swap');
      `}</style>
    </section>
  );
}