import React from 'react';

export type RiskLevel = 'stable' | 'tension' | 'critical';

interface AlertBannerProps {
  status: RiskLevel;
  onCtaClick?: () => void;
  count?: number; 
}

const RISK_STATE = {
  stable: {
    bannerColor: 'bg-green-600',
    bannerIcon: '✓',
    bannerTitle: 'Situation stable',
    ctaLabel: 'Tout est sécurisé',
    ctaDisabled: true,
  },
  tension: {
    bannerColor: 'bg-orange-500', 
    bannerIcon: '⚠️',
    bannerTitle: 'Zone de tension',
    ctaLabel: 'Surveillance active',
    ctaDisabled: false,
  },
  critical: {
    bannerColor: 'bg-red-600',
    bannerIcon: '🔥',
    bannerTitle: 'Situation critique',
    ctaLabel: 'Accéder à la War Room',
    ctaDisabled: false,
  },
};

export const AlertBanner: React.FC<AlertBannerProps> = ({ 
  status = 'stable',
  onCtaClick,
  count
}) => {
  const state = RISK_STATE[status] || RISK_STATE.stable;

  return (
    <div className={`rounded-xl px-8 py-6 text-white ${state.bannerColor} shadow-xl mb-12 animate-slideIn`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-3xl drop-shadow-md">{state.bannerIcon}</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{state.bannerTitle}</h1>
             {/* Optional: Add subtitle if we want to use the count prop contextually */}
             {count !== undefined && count > 0 && (
                 <p className="text-sm text-white/90 font-medium">
                     {status === 'critical' ? `${count} dossiers en danger immédiat` : 
                      status === 'tension' ? `${count} dossiers à surveiller` : 
                      'Aucune alerte majeure'}
                 </p>
             )}
          </div>
        </div>

        <button
          onClick={state.ctaDisabled ? undefined : onCtaClick}
          disabled={state.ctaDisabled}
          className={`
            px-5 py-2 rounded-lg font-bold text-sm transition-all
            ${state.ctaDisabled 
                ? 'bg-white/20 text-white/50 cursor-not-allowed' 
                : 'bg-white text-black hover:scale-105 shadow-lg'
            }
          `}
        >
          {state.ctaLabel} {state.ctaDisabled ? '' : '→'}
        </button>
      </div>
    </div>
  );
};
