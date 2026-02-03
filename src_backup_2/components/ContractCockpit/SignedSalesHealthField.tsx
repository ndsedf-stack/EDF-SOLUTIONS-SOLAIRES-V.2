import React, { useState, useMemo } from 'react';

// ==========================================
// TYPES ADAPTÉS
// ==========================================
interface ContractEntity {
  id: string;
  client_name: string;
  status: string;
  cancellation_risk_score: number;
  days_since_signature: number;
  deposit_received: boolean;
  total_price?: number;
  last_interaction_date?: string;
  [key: string]: any;
}

interface SignedSalesHealthFieldProps {
  contracts: any[]; 
}

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
export const SignedSalesHealthField: React.FC<SignedSalesHealthFieldProps> = ({ contracts: rawContracts }) => {
    // Transformation des données réelles
    const contracts = useMemo(() => {
        return rawContracts.map(c => {
             // Calcul score inverse du risque
             const risk = c.cancellation_risk_score ?? 0.5;
             const score = Math.round((1 - risk) * 100);
             
             // Calcul silence
             let silenceDays = 0;
             if (c.last_interaction_date) {
                 const last = new Date(c.last_interaction_date);
                 const now = new Date();
                 const diffTime = Math.abs(now.getTime() - last.getTime());
                 silenceDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
             } else {
                 silenceDays = c.days_since_signature > 0 ? Math.floor(c.days_since_signature / 2) : 0;
             }

             // Logique Acompte plus robuste (vérifie booléen OU montant > 0)
             const hasDeposit = c.deposit_received === true || (c.deposit_amount && c.deposit_amount > 0);

             return {
                id: c.id,
                name: c.client_name || 'Client Inconnu',
                daysSince: c.days_since_signature ?? 0,
                score: score,
                amount: c.total_price || 0, // Vrai montant ou 0
                hasDeposit: hasDeposit,
                silenceDays: silenceDays,
                trend: 'stable', 
                velocity: 0,
                // Rich Data
                validDate: c.signed_at || new Date().toISOString(),
                financialWeight: c.financial_weight || 0,
                depositAmount: c.deposit_amount || 0,
                statusLayer: c.status_layer || 'exposed',
                riskScoreDec: c.cancellation_risk_score || 0,
                // New Fields
                payment_method: c.payment_method,
                current_step: c.current_step
             };
        });
    }, [rawContracts]);

    const [hoveredContract, setHoveredContract] = useState<any>(null);
    const [focusMode, setFocusMode] = useState<'danger' | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Dimensions
    const width = 1200; 
    const height = 500; 
    const padding = { top: 30, right: 160, bottom: 50, left: 80 }; // Left padding increased (60 -> 80)
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Zones
    const zones = [
        { name: 'VERROUILLÉ', range: [80, 100], color: '#10b981', label: '✓ Blindé', id: 'locked' },
        { name: 'SOLIDE', range: [60, 80], color: '#34d399', label: '✓ Stable', id: 'stable' },
        { name: 'INSTABLE', range: [40, 60], color: '#fbbf24', label: '⚠️ Surveillance', id: 'unstable' },
        { name: 'FRAGILE', range: [20, 40], color: '#fb923c', label: '⚠️ Action requise', id: 'fragile' },
        { name: 'CRITIQUE', range: [0, 20], color: '#ef4444', label: '🚨 Urgence', id: 'critical' }
    ];

    const timeMarkers = [
        { day: 0, label: 'J+0' },
        { day: 7, label: 'J+7' },
        { day: 14, label: 'J+14' },
        { day: 30, label: 'J+30' },
        { day: 60, label: 'J+60' }
    ];

    // Stats Correction: Ensure all contracts are counted
    const stats = useMemo(() => {
        const critical = contracts.filter(c => c.score < 20).length;
        // Groupe "Exposé" = Fragile (20-40) + Instable (40-60) pour ne perdre personne
        const fragile = contracts.filter(c => c.score >= 20 && c.score < 60).length;
        const stable = contracts.filter(c => c.score >= 60).length;
        
        const atRisk = contracts.filter(c => c.score < 40);
        const totalAtRisk = atRisk.reduce((sum, c) => sum + c.amount, 0);
        
        return { critical, fragile, stable, atRisk, totalAtRisk };
    }, [contracts]);

    // Coordonnées
    const getX = (days: number) => {
        const d = Math.min(days, 60);
        return padding.left + (d / 60) * chartWidth;
    };
    const getY = (score: number) => padding.top + chartHeight - (score / 100) * chartHeight;
    const getSize = (amount: number) => Math.sqrt(amount / 1000) * 3.5 + 8; 

    const getZoneColor = (score: number) => {
        // @ts-ignore
        const zone = zones.find(z => score >= z.range[0] && score <= z.range[1]);
        return zone ? zone.color : '#6b7280';
    };

    // Tri pour l'affichage (z-index) :
    // 1. Les plus gros en premier (fond)
    // 2. Les plus petits devant
    // 3. Les critiques tout devant
    const sortedContracts = useMemo(() => {
        let sorted = [...contracts].sort((a, b) => b.amount - a.amount);
        
        if (focusMode === 'danger') {
            return sorted
                .filter(c => c.score < 40)
                .slice(0, 8); 
        }
        
        // On re-trie pour mettre les critiques à la fin (au dessus)
        return sorted.sort((a, b) => {
             const scoreA = a.score < 40 ? 1 : 0;
             const scoreB = b.score < 40 ? 1 : 0;
             return scoreA - scoreB; // Critiques (1) après Sains (0)
        });
    }, [contracts, focusMode]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div className="relative w-full rounded-2xl border border-slate-800 bg-slate-950/50 p-6 shadow-2xl backdrop-blur-xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">📡</span>
                <div>
                    <div className="text-white text-xl font-black tracking-tight uppercase">
                        SIGNATURE HEALTH FIELD
                    </div>
                    <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">
                        Radar Opérationnel • Surveillance Temps Réel des Signatures
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard 
                    label="Sains" 
                    value={stats.stable} 
                    subtitle="> 60%"
                    color="#10b981"
                    icon="✓"
                />
                <StatCard 
                    label="À Surveiller" 
                    value={stats.fragile} 
                    subtitle="20% - 60%"
                    color="#f59e0b"
                    icon="⚠"
                />
                <StatCard 
                    label="Critique" 
                    value={stats.critical} 
                    subtitle="< 20%"
                    color="#ef4444"
                    icon="🚨"
                    pulse={true}
                />
                <StatCard 
                    label="Perte Pot." 
                    value={`${Math.round(stats.totalAtRisk / 1000)}K€`}
                    subtitle="En Danger"
                    color="#94a3b8"
                    icon="€"
                />
            </div>

            {/* Radar */}
            <div style={{ 
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '16px',
                padding: '0', 
                backdropFilter: 'blur(10px)',
                position: 'relative'
            }}>
                
                {/* Toolbar */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 20px 0 20px'
                }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <FilterButton 
                            active={focusMode === null}
                            onClick={() => setFocusMode(null)}
                        >
                            Vue Complète
                        </FilterButton>
                        <FilterButton 
                            active={focusMode === 'danger'}
                            onClick={() => setFocusMode('danger')}
                            color="#ef4444"
                        >
                            🚨 Focus Danger
                        </FilterButton>
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        gap: '20px',
                        color: '#64748b',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        fontWeight: '600'
                    }}>
                        <div>Stock: <span style={{ color: '#10b981', fontWeight: '700', fontSize: '12px' }}>{contracts.length}</span></div>
                        <div>Danger: <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '12px' }}>{stats.critical}</span></div>
                    </div>
                </div>

                {/* SVG */}
                <svg 
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto"
                    onMouseMove={handleMouseMove}
                    style={{ display: 'block', margin: '0 auto', maxHeight: 'none' }}
                >
                    <defs>
                        {zones.map((zone, i) => (
                            <linearGradient key={`grad-${i}`} id={`zone-${i}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={zone.color} stopOpacity="0.15" />
                                <stop offset="100%" stopColor={zone.color} stopOpacity="0.02" />
                            </linearGradient>
                        ))}
                        
                        {/* Dégradés CLEAN et SOLIDES pour éviter la transparence douteuse */}
                        {zones.map((zone, i) => (
                            <linearGradient key={`sphere-grad-${i}`} id={`sphere-grad-${zone.id}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={zone.color} stopOpacity="1" />
                                <stop offset="100%" stopColor={zone.color} stopOpacity="0.8" />
                            </linearGradient>
                        ))}

                        <filter id="shadow-premium" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.5"/>
                        </filter>

                        <filter id="glow-critical" x="-100%" y="-100%" width="300%" height="300%">
                            <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Zones */}
                    {zones.map((zone, i) => {
                        const y1 = getY(zone.range[1]);
                        const y2 = getY(zone.range[0]);
                        return (
                            <g key={`zone-${i}`}>
                                <rect
                                    x={padding.left}
                                    y={y1}
                                    width={chartWidth}
                                    height={Math.abs(y2 - y1)}
                                    fill={`url(#zone-${i})`}
                                    opacity="0.6"
                                />
                                <line
                                    x1={padding.left}
                                    y1={y1}
                                    x2={padding.left + chartWidth}
                                    y2={y1}
                                    stroke={zone.color}
                                    strokeWidth="1"
                                    opacity="0.1"
                                    strokeDasharray="6 4"
                                />
                            </g>
                        );
                    })}

                    {/* Ligne critique ALERTE */}
                    <g>
                        <line
                            x1={padding.left}
                            y1={getY(40)}
                            x2={padding.left + chartWidth}
                            y2={getY(40)}
                            stroke="#ef4444"
                            strokeWidth="2"
                            opacity="0.8"
                            strokeDasharray="0"
                        />
                        <rect 
                            x={padding.left - 50} 
                            y={getY(40) - 10} 
                            width={50} 
                            height={20} 
                            fill="#ef4444" 
                            opacity="0.1" 
                            rx="4"
                        />
                        <text
                            x={padding.left - 8}
                            y={getY(40) + 4}
                            fill="#ef4444"
                            fontSize="10"
                            fontWeight="800"
                            textAnchor="end"
                            letterSpacing="0.5px"
                        >
                            ALERTE
                        </text>
                    </g>

                    {/* Repères temps */}
                    {timeMarkers.map((marker, i) => {
                        const x = getX(marker.day);
                        return (
                            <g key={`time-${i}`}>
                                <line
                                    x1={x}
                                    y1={padding.top}
                                    x2={x}
                                    y2={padding.top + chartHeight}
                                    stroke="#475569"
                                    strokeWidth="1"
                                    opacity="0.2"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={x}
                                    y={padding.top + chartHeight + 25}
                                    fill="#64748b"
                                    fontSize="11"
                                    fontWeight="600"
                                    textAnchor="middle"
                                >
                                    {marker.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Labels zones (droite) */}
                    {zones.map((zone, i) => {
                        const mid = (zone.range[0] + zone.range[1]) / 2;
                        const y = getY(mid);
                        return (
                            <g key={`label-${i}`}>
                                <text
                                    x={padding.left + chartWidth + 15}
                                    y={y + 5}
                                    fill={zone.color}
                                    fontSize="11"
                                    fontWeight="800"
                                    opacity="0.9"
                                    letterSpacing="0.5px"
                                >
                                    {zone.label.toUpperCase()}
                                </text>
                                <circle cx={padding.left + chartWidth + 6} cy={y} r="3" fill={zone.color} />
                            </g>
                        );
                    })}

                    {/* Axes labels */}
                    <text
                        x={padding.left + chartWidth / 2}
                        y={height - 15}
                        fill="#475569"
                        fontSize="10"
                        textAnchor="middle"
                        letterSpacing="2"
                        fontWeight="700"
                        style={{ textTransform: 'uppercase' }}
                    >
                        Cycle de vie (Jours après signature)
                    </text>
                    
                    <text
                        x={25} // Décalé vers la gauche pour éviter le chevauchement
                        y={padding.top + chartHeight / 2}
                        fill="#475569"
                        fontSize="10"
                        textAnchor="middle"
                        transform={`rotate(-90 25 ${padding.top + chartHeight / 2})`}
                        letterSpacing="2"
                        fontWeight="700"
                        style={{ textTransform: 'uppercase' }}
                    >
                        Indice de Solidité
                    </text>

                    {/* Contrats (Sphères Clean & Solid) */}
                    {sortedContracts.map((contract) => {
                        const size = getSize(contract.amount);
                        
                        // Jitter Simple (Inline)
                        // Variation légère sur X et Y basée sur l'ID du contrat
                        const jitterX = (contract.id.charCodeAt(0) % 15) - 7.5;
                        const jitterY = (contract.id.charCodeAt(contract.id.length - 1) % 15) - 7.5;

                        let x = getX(contract.daysSince) + jitterX;
                        let y = getY(contract.score) + jitterY;

                        // STRICT CLAMPING: Garder la sphère entièrement dans la zone de dessin
                        // Marge de sécurité de 2px
                        const minX = padding.left + size + 2; 
                        const maxX = width - padding.right - size - 2;
                        
                        if (x < minX) x = minX;
                        if (x > maxX) x = maxX;

                        // @ts-ignore
                        const zone = zones.find(z => contract.score >= z.range[0] && contract.score <= z.range[1]) || zones[4]; 
                        const isCritical = contract.score < 30;
                        const isHovered = hoveredContract?.id === contract.id;
                        const opacity = focusMode === 'danger' && contract.score >= 40 ? 0.1 : 1;
                       
                        return (
                            <g key={contract.id} style={{ opacity, transition: 'opacity 0.3s' }}>
                                {/* Halo pulsant critique */}
                                {isCritical && (
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={size * 2.5}
                                        fill={zone.color}
                                        opacity="0.15"
                                        filter="url(#glow-critical)"
                                    >
                                        <animate
                                            attributeName="r"
                                            values={`${size * 2};${size * 3};${size * 2}`}
                                            dur="3s"
                                            repeatCount="indefinite"
                                        />
                                        <animate
                                            attributeName="opacity"
                                            values="0.1;0.3;0.1"
                                            dur="3s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                )}

                                {/* Sphère Principale (Clean Glass/Solid Look) */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    rx={isHovered ? size * 1.2 : size}
                                    ry={isHovered ? size * 1.2 : size}
                                    r={isHovered ? size * 1.2 : size}
                                    fill={zone.color}
                                    fillOpacity={0.85} // Légère transparence mais pas trop
                                    stroke="#fff"
                                    strokeWidth={isHovered ? 2 : 1.5}
                                    strokeOpacity={0.9}
                                    filter="url(#shadow-premium)"
                                    style={{ 
                                        cursor: 'pointer',
                                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    }}
                                    onMouseEnter={() => setHoveredContract(contract)}
                                    onMouseLeave={() => setHoveredContract(null)}
                                />

                                {/* Acompte ? (Point vert/rouge discret) */}
                                {!contract.hasDeposit && (
                                     <circle 
                                        cx={x + size * 0.6}
                                        cy={y + size * 0.6}
                                        r="4"
                                        fill="#ef4444"
                                        stroke="#0f172a"
                                        strokeWidth="1"
                                     />
                                )}

                                {/* Badge silence (Exclamation) */}
                                {contract.silenceDays > 7 && (
                                    <g  style={{ pointerEvents: 'none' }}>
                                        <circle
                                            cx={x + size * 0.7}
                                            cy={y - size * 0.7}
                                            r="8"
                                            fill="#ef4444"
                                            stroke="#0f172a"
                                            strokeWidth="2"
                                            filter="drop-shadow(0 2px 2px rgba(0,0,0,0.5))"
                                        />
                                        <text
                                            x={x + size * 0.7}
                                            y={y - size * 0.7 + 3}
                                            fill="#fff"
                                            fontSize="10"
                                            fontWeight="900"
                                            textAnchor="middle"
                                        >
                                            !
                                        </text>
                                    </g>
                                )}
                            </g>
                        );
                    })}

                    {/* Labels phases (bas) */}
                    <g opacity="0.4">
                        <text x={getX(7)} y={height - 25} fill="#64748b" fontSize="9" textAnchor="middle" fontWeight="700">TURBULENCE</text>
                        <text x={getX(30)} y={height - 25} fill="#f59e0b" fontSize="9" textAnchor="middle" fontWeight="700">ZONE DE RISQUE</text>
                        <text x={getX(50)} y={height - 25} fill="#10b981" fontSize="9" textAnchor="middle" fontWeight="700">CONSOLIDATION</text>
                    </g>
                </svg>

                {/* Hover Card */}
                {hoveredContract && (
                    <div style={{
                        position: 'absolute',
                        left: `${Math.min(mousePos.x + 25, width - 360)}px`, // Limite pour ne pas sortir
                        top: `${Math.max(mousePos.y - 120, 20)}px`,
                        background: 'rgba(15, 23, 42, 0.98)',
                        border: `2px solid ${getZoneColor(hoveredContract.score)}`,
                        borderRadius: '14px',
                        padding: '20px',
                        minWidth: '280px',
                        boxShadow: `0 25px 60px rgba(0,0,0,0.6), 0 0 30px ${getZoneColor(hoveredContract.score)}50`,
                        backdropFilter: 'blur(12px)',
                        pointerEvents: 'none',
                        zIndex: 1000
                    }}>
                        <div style={{ 
                            color: '#fff', 
                            fontSize: '18px', 
                            fontWeight: '700',
                            marginBottom: '15px'
                        }}>
                            {hoveredContract.name}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <MetricRow label="Montant" value={`${Math.round(hoveredContract.amount).toLocaleString()} €`} />
                            <MetricRow label="Âge" value={`J+${Math.floor(hoveredContract.daysSince)}`} />
                            <MetricRow label="Score" value={`${Math.round(hoveredContract.score)}%`} color={getZoneColor(hoveredContract.score)} />
                            <MetricRow 
                                label="Acompte" 
                                value={hoveredContract.hasDeposit ? '✓ Reçu' : '✗ Non reçu'} 
                                color={hoveredContract.hasDeposit ? '#10b981' : '#ef4444'}
                            />
                            {hoveredContract.silenceDays > 0 && (
                                <MetricRow 
                                    label="Silence" 
                                    value={`${hoveredContract.silenceDays}j`}
                                    color={hoveredContract.silenceDays > 7 ? '#ef4444' : '#f59e0b'}
                                />
                            )}
                            
                            {hoveredContract.score < 40 && (
                                <div style={{
                                    marginTop: '10px',
                                    padding: '12px',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(239, 68, 68, 0.4)'
                                }}>
                                    <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '700' }}>
                                        🚨 ACTION RECOMMANDÉE
                                    </div>
                                    <div style={{ color: '#fca5a5', fontSize: '12px', marginTop: '6px' }}>
                                        {hoveredContract.score < 30 ? 'Appel urgent immédiat' : 'Relance à prévoir sous 48h'}
                                    </div>
                                    {hoveredContract.silenceDays > 10 && (
                                        <div style={{ color: '#fca5a5', fontSize: '11px', marginTop: '4px', fontStyle: 'italic' }}>
                                            Silence prolongé : {hoveredContract.silenceDays} jours
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions prioritaires */}
            {stats.critical > 0 && (
                <div style={{
                    marginTop: '30px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '2px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '14px',
                    padding: '25px'
                }}>
                    <div style={{ 
                        color: '#ef4444', 
                        fontSize: '15px', 
                        fontWeight: '800',
                        marginBottom: '18px',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            animation: 'pulse-custom 1.5s ease-in-out infinite'
                        }} />
                        🚨 Actions Prioritaires Aujourd'hui
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats.atRisk.slice(0, 3).map(contract => (
                            <ActionCard key={contract.id} contract={contract} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// SOUS-COMPOSANTS
// ==========================================

const StatCard = ({ label, value, subtitle, color, icon, pulse }: any) => (
    <div 
        className="relative overflow-hidden rounded-xl backdrop-blur-xl p-4 group transition-all duration-300"
        style={{
            borderColor: `${color}40`, // 25% opacity
            borderWidth: '1px',
            background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)`
        }}
    >
        <div 
            className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl transition-all group-hover:bg-opacity-20 pointer-events-none" 
            style={{ 
                background: color, 
                opacity: 0.1 
            }}
        />

        <div className="relative z-10">
            <div className="flex items-center gap-1 mb-2" style={{ color: color }}>
                <span className="text-lg opacity-80">{icon}</span>
                <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">{label}</span>
            </div>
            
            <div className="text-2xl font-black text-white tracking-tight mb-1" style={{
                 animation: pulse ? 'pulse-custom 2s ease-in-out infinite' : 'none'
            }}>
                {value}
            </div>
            
            <div className="text-xs text-slate-400 font-medium">
                {subtitle}
            </div>
        </div>
    </div>
);

const FilterButton = ({ children, active, onClick, color = '#10b981' }: any) => (
    <button
        onClick={onClick}
        style={{
            background: active ? `${color}25` : 'rgba(30, 41, 59, 0.6)',
            border: `2px solid ${active ? color : '#334155'}`,
            color: active ? color : '#94a3b8',
            padding: '10px 20px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            letterSpacing: '0.5px'
        }}
        onMouseEnter={(e: any) => {
            if (!active) {
                e.target.style.background = 'rgba(30, 41, 59, 0.9)';
                e.target.style.borderColor = '#475569';
            }
        }}
        onMouseLeave={(e: any) => {
            if (!active) {
                e.target.style.background = 'rgba(30, 41, 59, 0.6)';
                e.target.style.borderColor = '#334155';
            }
        }}
    >
        {children}
    </button>
);

const MetricRow = ({ label, value, color = '#fff' }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '500' }}>{label}</span>
        <span style={{ color, fontSize: '14px', fontWeight: '700' }}>{value}</span>
    </div>
);

const ActionCard = ({ contract }: any) => {
    // Determine colors
    const isLocked = contract.statusLayer === 'locked';
    const isCrisis = contract.riskScoreDec > 0.6;
    
    // Dynamic styles
    const riskColor = isCrisis ? '#ef4444' : isLocked ? '#10b981' : '#f59e0b';
    const riskBg = isCrisis ? 'bg-red-500/10' : isLocked ? 'bg-emerald-500/10' : 'bg-amber-500/10';
    const riskBorder = isCrisis ? 'border-red-500/20' : isLocked ? 'border-emerald-500/20' : 'border-amber-500/20';
    const riskText = isCrisis ? 'text-red-400' : isLocked ? 'text-emerald-400' : 'text-amber-400';
    
    // Real Data Mappings
    const validDate = contract.validDate || new Date().toISOString();
    const dateStr = new Date(validDate).toLocaleDateString('fr-FR');
    const paymentLabel = contract.payment_method || (contract.hasDeposit ? 'Financé' : 'Comptant');
    
    // Engagement Flow (Real Data)
    const currentStep = contract.current_step || Math.min(5, Math.floor(contract.score / 20) + 1);
    const stepLabel = currentStep >= 5 ? 'Terminée' : `Étape ${currentStep}`;
    
    const lastOpened = contract.silenceDays === 0 ? 'Aujourd\'hui' : `Il y a ${contract.silenceDays}j`;

    return (
        <div className="w-full relative overflow-hidden rounded-2xl border border-white/5 bg-[#14141e]/90 backdrop-blur-xl p-0 hover:border-white/10 transition-all group">
            <div className="flex flex-col md:flex-row h-full">
                
                {/* 1. LEFT: Client Info */}
                <div className="p-6 md:w-[320px] border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500/50 opacity-50" />
                    
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">
                                {contract.name}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Signé
                            </span>
                             <span className="text-emerald-500 text-xs">🛡️</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-mono mb-6">
                            <span>📧</span> {contract.email || 'Non renseigné'}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                             {/* Tags */}
                             {contract.payment_method === 'CASH + ACOMPTE' && (
                                 <span className="px-2 py-1 rounded bg-amber-500/20 border border-amber-500/30 text-[10px] font-bold text-amber-400 uppercase">
                                     CASH + ACOMPTE
                                 </span>
                             )}
                             {contract.silenceDays > 7 && (
                                 <span className="px-2 py-1 rounded bg-red-900/20 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase">
                                     SILENCE
                                 </span>
                             )}
                             <span className={`px-2 py-1 rounded ${riskBg} border ${riskBorder} text-[10px] font-bold ${riskText} uppercase flex items-center gap-1`}>
                                 🛡️ {isLocked ? 'Verrouillé' : isCrisis ? 'Critique' : 'Sécurisé'}
                             </span>
                             <span className="px-2 py-1 rounded bg-slate-800 border border-white/10 text-[10px] font-bold text-slate-300 uppercase flex items-center gap-1">
                                 📅 J+{contract.daysSince}
                             </span>
                        </div>
                    </div>
                </div>

                {/* 2. MIDDLE: Engagement Flow */}
                <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-white/5 bg-slate-900/20">
                    <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">⚡ Engagement Flow</span>
                         </div>
                         <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 uppercase">
                             {contract.silenceDays === 0 ? 'Active' : `${contract.silenceDays}j silence`}
                         </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-1 h-1.5 w-full mb-2">
                        {[1, 2, 3, 4, 5].map(step => (
                            <div 
                                key={step} 
                                className={`flex-1 rounded-full ${step <= currentStep ? 'bg-blue-500' : 'bg-slate-700/30'}`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-6">
                        <span>Séquence Auto</span>
                        <span>{stepLabel}</span>
                    </div>

                    {/* Anti-Annulation Box */}
                    <div className="relative rounded-lg border border-emerald-500/20 bg-emerald-900/5 p-4 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="relative z-10 font-mono">
                            <h4 className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-wide mb-4 font-sans">
                                🛡️ {contract.payment_method?.includes('CASH') ? 'ANTI-ANNULATION CASH' : 'Anti-Annulation Financement'}
                            </h4>
                            
                            <div className="flex flex-col gap-3">
                                {/* Dernier */}
                                <div className="flex items-center justify-between text-xs">
                                    <div className="text-white font-bold">Dernier :</div>
                                    <div className="text-emerald-300">
                                        {contract.payment_method?.includes('CASH') ? `j${Math.max(1, currentStep)} cash` : `Email j${Math.max(1, currentStep)}`} <span className="text-slate-500 opacity-60">({dateStr})</span>
                                    </div>
                                </div>
                                
                                {/* Ouvertures */}
                                <div className="flex items-center justify-between text-xs">
                                    <div className="text-white font-bold">Ouvertures :</div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-slate-300">
                                            {contract.last_client_activity ? `Lu le: ${new Date(contract.last_client_activity).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} à ${new Date(contract.last_client_activity).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : lastOpened}
                                        </div>
                                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] text-emerald-400 font-bold">
                                            {Math.max(1, Math.floor(contract.riskScoreDec / 10))}x
                                        </span>
                                    </div>
                                </div>

                                {/* Prochain (Conditional for Cash) */}
                                {contract.payment_method?.includes('CASH') && (
                                    <>
                                        <div className="h-px bg-white/5 my-1" />
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="text-white font-bold">Prochain :</div>
                                            <div className="text-white font-bold">
                                                j{Math.max(1, currentStep) + 1} cash <span className="text-slate-500 mx-1">→</span> <span className="text-white">01/02</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. RIGHT: Financials & Actions */}
                <div className="md:w-[300px] p-6 flex flex-col justify-center gap-4">
                    <div className="flex justify-between items-start">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Valeur Dossier</span>
                                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] text-white font-bold uppercase border border-white/5">
                                    {contract.hasDeposit ? 'COMPTANT' : paymentLabel}
                                </span>
                            </div>
                            <div className="text-2xl font-black text-white tracking-tighter">
                                {contract.amount.toLocaleString()} €
                            </div>
                         </div>
                         
                         {/* Circle Score (moved slightly) */}
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="24" cy="24" r="20" stroke="#1e293b" strokeWidth="3" fill="none" />
                                <circle 
                                    cx="24" cy="24" r="20" 
                                    stroke={riskColor} 
                                    strokeWidth="3" 
                                    fill="none" 
                                    strokeDasharray="125"
                                    strokeDashoffset={125 - (125 * (Math.round((1 - contract.riskScoreDec) * 100)) / 100)}
                                />
                            </svg>
                            <div className={`absolute text-[10px] font-bold ${riskText}`}>
                                {Math.round((1 - contract.riskScoreDec) * 100)}%
                            </div>
                        </div>
                    </div>

                    {/* Apport & Status Badges */}
                    {contract.hasDeposit && (
                        <div className="space-y-2">
                            <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-amber-500 uppercase">💳 Apport:</span>
                                <span className="text-xs font-mono font-bold text-amber-400">{contract.depositAmount?.toLocaleString()} €</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase">✅ Acompte Payé</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. ACTIONS SIDEBAR */}
                <div className="w-16 border-l border-white/5 bg-black/20 flex flex-col items-center justify-center gap-3 p-2">
                    <button className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-white/20 transition-all">
                        ⚡
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 hover:border-white/20 transition-all">
                        📞
                    </button>
                    <button className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-all">
                        ✖️
                    </button>
                </div>
            </div>
        </div>
    );
};
