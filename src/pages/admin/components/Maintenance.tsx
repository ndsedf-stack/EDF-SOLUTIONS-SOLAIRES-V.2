import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const MaintenanceAction = ({ title, description, buttonLabel, warning, danger }: any) => (
    <div className={`p-6 bg-[#0a0a0a] border ${danger ? 'border-red-500/30' : 'border-white/5'} rounded-xl `}>
        <h3 className={`text-lg font-bold mb-2 ${danger ? 'text-red-500' : 'text-white'}`}>{title}</h3>
        <p className="text-sm text-slate-500 mb-6">{description}</p>
        
        {warning && (
            <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded mb-6 text-xs text-orange-400 font-mono">
                ⚠️ {warning}
            </div>
        )}

        <button className={`w-full py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all ${
            danger 
                ? 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500' 
                : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
        }`}>
            {buttonLabel}
        </button>
    </div>
);

export const Maintenance = () => {
    const [safeMode, setSafeMode] = useState(false);
    const [shadowBrain, setShadowBrain] = useState(true);
    const [status, setStatus] = useState('');

    const fixAlbertini = async () => {
        setStatus('Searching for Albertini...');
        try {
            // 1. Find the study
            // Let's try a broader search on clients first.
            const { data: clients } = await supabase.from('clients').select('id').ilike('last_name', '%Albertini%');
            
            if (!clients || clients.length === 0) {
                setStatus('❌ Client Albertini not found');
                return;
            }

            const clientId = clients[0].id;
            const { data: study } = await supabase.from('studies').select('*').eq('client_id', clientId).single();

            if (!study) {
                setStatus('❌ Study for Albertini not found');
                return;
            }

            // 2. Update the study
            const newStudyData = { ...study.study_data, cancellation_reason: 'Raison Technique / Toiture' };
            const { error } = await supabase
                .from('studies')
                .update({ study_data: newStudyData })
                .eq('id', study.id);

            if (error) throw error;

            // 3. Update or Add Log
            await supabase.from('decision_logs').insert({
                study_id: study.id,
                client_name: 'Albertini',
                action_performed: 'DATA_FIX_REASON',
                justification: 'Correction manuelle: Raison Technique / Toiture'
            });

            setStatus('✅ FIX APPLIED: Albertini updated to "Raison Technique"');

        } catch (e: any) {
            setStatus('❌ Error: ' + e.message);
        }
    };

    return (
        <div className="max-w-5xl space-y-8">
            <div className="bg-orange-500/10 border border-orange-500 rounded-xl p-6 flex items-start gap-4">
                <span className="text-3xl">🛡️</span>
                <div>
                    <h3 className="text-lg font-bold text-orange-500 uppercase tracking-widest mb-2">Zone de Maintenance Système</h3>
                    <p className="text-slate-300 text-sm">
                        Les actions ici impactent directement la production et la base de données. 
                        Toute opération est logguée avec votre ID session (Session #4402A).
                    </p>
                </div>
            </div>

            <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1 border-l-4 border-slate-500">Modes de Fonctionnement</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-white">Shadow Brain (Lecture Seule)</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">L'IA analyse mais ne prend aucune décision ni action. Idéal pour le debug.</p>
                    </div>
                    <button 
                        onClick={() => setShadowBrain(!shadowBrain)}
                        className={`w-14 h-8 rounded-full p-1 transition-colors ${shadowBrain ? 'bg-blue-600' : 'bg-slate-700'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${shadowBrain ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                 <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 flex justify-between items-center">
                    <div>
                        <h4 className="font-bold text-white">Safe Mode (Arrêt d'Urgence)</h4>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs">Bloque immédiatement tous les emails sortants et les mises à jour CRM.</p>
                    </div>
                    <button 
                         onClick={() => setSafeMode(!safeMode)}
                        className={`w-14 h-8 rounded-full p-1 transition-colors ${safeMode ? 'bg-red-600' : 'bg-slate-700'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${safeMode ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1 border-l-4 border-blue-500 pt-8">Corrections de Données (Legacy)</h3>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-6 flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                    <div>
                         <h4 className="font-bold text-white">Patch Dossier "Albertini"</h4>
                         <p className="text-xs text-slate-500 mt-1 max-w-md">
                            Le dossier a été annulé avant la mise à jour du motif. 
                            Ce patch force le motif "Raison Technique" pour corriger les stats Pilotage.
                         </p>
                    </div>
                    <button 
                        onClick={fixAlbertini}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20"
                    >
                        Appliquer Patch
                    </button>
                 </div>
                 {status && (
                    <div className={`mt-2 p-3 rounded-lg border text-xs font-mono ${status.includes('✅') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {status}
                    </div>
                 )}
            </div>

            <h3 className="text-sm font-bold text-white uppercase tracking-widest pl-1 border-l-4 border-red-500 pt-8">Actions Destructives</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MaintenanceAction 
                    title="Purge Cache" 
                    description="Vide le cache Redis et Force-Refresh de tous les clients connectés via WebSocket." 
                    buttonLabel="Vider le Cache" 
                />
                <MaintenanceAction 
                    title="Reset État Agents" 
                    description="Redémarre les instances d'Agent Zero et efface leur mémoire court terme." 
                    buttonLabel="Redémarrer Agents" 
                    warning="Interruption de service ~30s"
                />
                <MaintenanceAction 
                    title="Nuke Database (Dev Only)" 
                    description="Supprime toutes les tables et restaure le schéma initial." 
                    buttonLabel="☠️ NUKE DB" 
                    danger={true}
                    warning="IRRÉVERSIBLE. PERTE TOTALE DES DONNÉES."
                />
            </div>
        </div>
    );
};
