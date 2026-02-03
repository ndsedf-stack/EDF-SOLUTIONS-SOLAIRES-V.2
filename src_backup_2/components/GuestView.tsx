import React, { useEffect, useState } from 'react';
import { ShieldCheck, Download, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { Study } from '@/brain/types';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import COPY from '@/content/copy.json';

// Pour la démo, on simule une props ou un fetch
// Dans la vraie vie, ce composant serait monté via un router sur /guest/:token
interface GuestViewProps {
  study?: Study;
  token?: string;
}

export default function GuestView({ study: initialStudy }: GuestViewProps) {
  const [study, setStudy] = useState<Study | null>(initialStudy || null);
  const [loading, setLoading] = useState(!initialStudy);
  const [error, setError] = useState<string | null>(null);

  // Simulation de chargement si pas de study passée (mode standalone)
  useEffect(() => {
    if (!study) {
      // TODO: Fetch study from Supabase via token
      // const { data } = await supabase.from('studies').select('*').eq('guest_view_token', token).single();
      setLoading(false);
      setError("Lien invalide ou expiré (Mode démo: passer une study en props)");
    }
  }, [study]);

  // Tracking VIEW event
  useEffect(() => {
    if (study && !study.email_optout) {
      // Fire & forget tracking
      console.log(`[GuestView] Tracking VIEW for study ${study.id}`);
      // supabase.from('tracking_events').insert({ ... })
    }
  }, [study]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !study) {
     return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
                <ShieldCheck className="mx-auto text-slate-300 w-12 h-12 mb-4" />
                <h1 className="text-xl font-bold text-slate-800 mb-2">Accès Impossible</h1>
                <p className="text-slate-500 text-sm">{error || "Document introuvable."}</p>
            </div>
        </div>
     );
  }

  const { client_id, install_cost, total_price, deposit_amount } = study;
  // Fallback si total_price non défini, on prend install_cost
  const finalPrice = total_price || install_cost || 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* HEADER PUBLIC */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                EDF
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-700">SOLUTIONS SOLAIRES</span>
          </div>
          <a
            href="https://www.edfenr.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            Site Officiel <ExternalLink size={10} />
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* TITRE DOSSIER */}
        <div className="mb-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-3">
                <CheckCircle size={12} />
                Étude Validée & Dispo.
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                Votre projet d'autoconsommation
            </h1>
            <p className="text-slate-500">
                Référence dossier: <span className="font-mono text-slate-700">{study.id.slice(0, 8).toUpperCase()}</span>
            </p>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* GAUCHE : DÉTAILS */}
            <div className="md:col-span-2 space-y-6">
                
                {/* CARTE DE SYNTHÈSE */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                            Synthèse Financière
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Montant Projet</div>
                                <div className="text-3xl font-bold text-slate-900">{formatCurrency(finalPrice)}</div>
                                <div className="text-xs text-slate-400 mt-1">TTC (TVA incluse)</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Acompte à régler</div>
                                <div className="text-3xl font-bold text-blue-600">{formatCurrency(deposit_amount)}</div>
                                <div className="text-xs text-slate-400 mt-1">Pour sécuriser le dossier</div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
                             <Calendar className="text-slate-400 mt-0.5" size={18} />
                             <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-1">Validité de l'offre</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Cette proposition technique et financière est garantie jusqu'au <span className="font-medium text-slate-800">{new Date(Date.now() + 7 * 86400000).toLocaleDateString("fr-FR")}</span>. 
                                    Passé ce délai, les conditions de rachat ou les primes de l'État pourraient évoluer.
                                </p>
                             </div>
                        </div>
                    </div>
                    
                    {/* ACTIONS */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <button 
                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-medium transition-colors"
                            onClick={() => console.log('Download PDF')}
                        >
                            <Download size={16} />
                            Télécharger l'étude (.pdf)
                        </button>
                        <button 
                            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all text-sm"
                            onClick={() => console.log('Contact Advisor')}
                        >
                            Contacter mon conseiller
                        </button>
                    </div>
                </div>

                {/* GARANTIES */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                      <h3 className="font-bold text-slate-800 mb-4">{COPY.financial.guarantees_title}</h3>
                      <div className="space-y-3">
                            {COPY.financial.guarantees_list.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-600">{item}</p>
                                </div>
                            ))}
                      </div>
                </div>

            </div>

            {/* DROITE : RASSURANCE & CONTACT */}
            <div className="space-y-6">
                 <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-xl shadow-blue-900/20 relative overflow-hidden">
                    {/* Pattern background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    
                    <ShieldCheck className="text-blue-300 w-10 h-10 mb-4" />
                    <h3 className="font-bold text-lg mb-2">EDF Solutions Solaires</h3>
                    <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                        Filiale d'EDF dédiée aux installations photovoltaïques. Choisir EDF ENR, c'est choisir la sécurité d'un leader énergétique pour 25 ans.
                    </p>
                    <div className="pt-6 border-t border-white/10">
                        <p className="text-xs text-blue-200 uppercase font-bold tracking-wider mb-1">Votre Conseiller</p>
                        <p className="font-medium">Agence Nice & Alpes-Maritimes</p>
                        <p className="text-sm text-blue-100">0 809 404 004 (Service gratuit)</p>
                    </div>
                 </div>

                 <div className="text-center">
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        {COPY.financial.legal_mention}
                    </p>
                 </div>
            </div>
        </div>
      </main>
    </div>
  );
}
