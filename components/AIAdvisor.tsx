import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { LoanParams, CalculationResult, AIAnalysisState } from '../types';
import { formatCurrency } from '../utils/finance';

interface AIAdvisorProps {
  params: LoanParams;
  results: CalculationResult;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ params, results }) => {
  const [state, setState] = useState<AIAnalysisState>({
    loading: false,
    response: null,
    error: null,
  });

  const analyzeLoan = async () => {
    setState({ loading: true, response: null, error: null });

    try {
      if (!process.env.API_KEY) {
        throw new Error("API Key is missing in environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        Agis comme un conseiller financier expert pour EDF Solaires. Analyse ce scénario de financement :
        
        Montant à financer : ${formatCurrency(params.amount)}
        Taux d'intérêt : ${params.rate}%
        Durée : ${params.years} ans
        Mensualité (Crédit + Assurance) : ${formatCurrency(results.monthlyPayment)}
        Total Intérêts payés : ${formatCurrency(results.totalInterest)}
        Coût total du financement : ${formatCurrency(results.totalPayment)}

        Fournis une analyse concise en 3 points (en français) :
        1. La structure du financement est-elle saine ?
        2. Quel est l'impact réel du taux d'intérêt sur la rentabilité ?
        3. Un conseil actionnable pour optimiser ce montage (ex: apport, durée).
        
        Ton ton doit être professionnel, encourageant et expert. Utilise un formatage clair.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setState({
        loading: false,
        response: response.text,
        error: null,
      });

    } catch (err: any) {
      console.error(err);
      setState({
        loading: false,
        response: null,
        error: err.message || "Échec de l'analyse. Veuillez réessayer.",
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <svg width="100" height="100" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
          <path d="M12 6a1 1 0 0 0-1 1v5.59l-3.29-3.3a1 1 0 0 0-1.42 1.42l5 5a1 1 0 0 0 1.42 0l5-5a1 1 0 0 0-1.42-1.42L13 12.59V7a1 1 0 0 0-1-1z" />
        </svg>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500 rounded-lg">
             {/* Sparkles Icon */}
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 3.214L13 21l-2.286-6.857L5 12l5.714-3.214L13 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">L'Avis de l'Expert IA</h2>
        </div>

        {state.response ? (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="whitespace-pre-line leading-relaxed text-slate-200">
                {state.response}
              </p>
            </div>
            <button 
              onClick={analyzeLoan}
              className="mt-4 text-xs text-indigo-300 hover:text-white transition-colors underline"
            >
              Actualiser l'analyse
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-300 text-sm">
              Obtenez une évaluation instantanée par IA de votre scénario de financement pour comprendre les risques et opportunités.
            </p>
            <button
              onClick={analyzeLoan}
              disabled={state.loading}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            >
              {state.loading ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Analyse en cours...
                </>
              ) : (
                'Analyser avec Gemini'
              )}
            </button>
          </div>
        )}
        
        {state.error && (
          <div className="mt-3 text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-900/50">
            {state.error}
          </div>
        )}
      </div>
    </div>
  );
};
