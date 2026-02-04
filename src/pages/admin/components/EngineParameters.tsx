import React, { useState } from 'react';

const ParameterGroup = ({ title, description, children }: any) => (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-6 max-w-2xl">{description}</p>
        <div className="space-y-8">
            {children}
        </div>
    </div>
);

const RangeSlider = ({ label, value, min, max, unit, description, onChange }: any) => (
    <div>
        <div className="flex justify-between mb-2">
            <label className="text-sm font-bold text-slate-300">{label}</label>
            <span className="text-sm font-bold text-orange-500">{value}{unit}</span>
        </div>
        <input 
            type="range" 
            min={min} 
            max={max} 
            value={value} 
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1 font-mono uppercase">
            <span>Min: {min}{unit}</span>
            <span>Max: {max}{unit}</span>
        </div>
        {description && <p className="text-xs text-slate-500 mt-2 italic border-l-2 border-slate-700 pl-3">{description}</p>}
    </div>
);

const Toggle = ({ label, checked, onChange, help }: any) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
        <div>
            <div className="text-sm font-bold text-slate-200">{label}</div>
            {help && <div className="text-xs text-slate-500 mt-1">{help}</div>}
        </div>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${checked ? 'bg-orange-600' : 'bg-slate-700'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

export const EngineParameters = () => {
    const [dangerThreshold, setDangerThreshold] = useState(70);
    const [weightBehavior, setWeightBehavior] = useState(40);
    const [weightFinancial, setWeightFinancial] = useState(30);
    const [weightTime, setWeightTime] = useState(30);
    const [autoArchive, setAutoArchive] = useState(false);
    const [strictMode, setStrictMode] = useState(true);

    return (
        <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                     <h2 className="text-xl font-bold text-white mb-2">Configuration du Moteur</h2>
                     <p className="text-slate-500 text-sm">Chaque modification est journalisée dans l'Audit Trail (Forensique).</p>
                </div>
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg uppercase text-xs tracking-wider transition-all border border-white/10 flex items-center gap-2">
                    <span>↺</span> Annuler modifications
                </button>
            </div>

            <ParameterGroup 
                title="Seuils de Tolérance (Danger Score)" 
                description="Définissez à partir de quel score une opportunité bascule en zone critique."
            >
                <RangeSlider 
                    label="Seuil d'Alerte Critique (Zone de Mort)" 
                    value={dangerThreshold} 
                    min={50} 
                    max={95} 
                    unit="/100" 
                    onChange={setDangerThreshold}
                    description="Si le score dépasse cette valeur, l'opportunité passe en priorité absolue et alerte le N+1."
                />
            </ParameterGroup>

            <ParameterGroup 
                title="Pondération des Signaux (Total = 100%)" 
                description="Influence relative de chaque dimension sur le calcul du score final."
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <RangeSlider 
                        label="Comportemental" 
                        value={weightBehavior} 
                        min={0} max={100} unit="%" 
                        onChange={setWeightBehavior}
                    />
                    <RangeSlider 
                        label="Financier (ROI)" 
                        value={weightFinancial} 
                        min={0} max={100} unit="%" 
                        onChange={setWeightFinancial}
                    />
                    <RangeSlider 
                        label="Temporel (Récence)" 
                        value={weightTime} 
                        min={0} max={100} unit="%" 
                        onChange={setWeightTime}
                    />
                </div>
                {(weightBehavior + weightFinancial + weightTime) !== 100 && (
                    <div className="p-3 bg-red-500/10 border border-red-500 text-red-500 text-xs font-bold rounded mt-4 flex items-center gap-2">
                        ⚠️ Le total des pondérations doit être égal à 100% (Actuel : {weightBehavior + weightFinancial + weightTime}%)
                    </div>
                )}
            </ParameterGroup>

            <ParameterGroup 
                title="Règles d'Orchestration" 
                description="Comportements globaux de l'IA et de l'Agent Zero."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Toggle 
                        label="Mode Strict (Gouvernance)" 
                        checked={strictMode} 
                        onChange={setStrictMode} 
                        help="Si activé, aucune action n'est permise sans validation Ops."
                    />
                    <Toggle 
                        label="Auto-Archivage > 30j" 
                        checked={autoArchive} 
                        onChange={setAutoArchive} 
                        help="Archive automatiquement les leads sans interaction depuis 30 jours."
                    />
                </div>
            </ParameterGroup>

            <div className="sticky bottom-6 bg-[#0a0a0a]/90 backdrop-blur-xl border border-orange-500/30 p-4 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex justify-between items-center">
                <div className="text-xs text-orange-500 font-mono">
                    ⚠️ Vous êtes sur le point de modifier la politique de risque globale.
                </div>
                <button className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg shadow-lg shadow-orange-600/20 transform hover:-translate-y-1 transition-all">
                    APPLIQUER LA POLITIQUE
                </button>
            </div>
        </div>
    );
};
