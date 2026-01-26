import { BrainEntity, BrainContext, Probability } from "../types";
import { IntelligenceEngine, EngineResult, StartParams } from "./types";
import { BrainSignal, BrainSignalDomain } from "../signals/types";
import { detectFinancialSignals } from "../signals/financial";
import { detectEngagementSignals } from "../signals/engagement";
import { detectContractSignals } from "../signals/contract";
import { Study } from "@/brain/types";
import { SIGNALS_CATALOG } from "../signals/signalsRegistry";

// ==========================================
// TYPES SPÉCIFIQUES CVI
// ==========================================

export interface CVIOutput {
  cviScore: number; // 0-100
  status: "STABLE" | "VOLATILE" | "CRITICAL" | "LOST";
  dominantDrivers: BrainSignalDomain[]; // Domaines impactant le plus le score
  activeSignals: import("../signals/types").BrainSignal[]; // <--- NEW: List of signals driving the score
  systemConfidence: Probability; // Confiance du système dans son diagnostic
  reasoning?: string[]; // <--- NEW: Textual logs
  executiveSummary: string; // <--- NEW: High-level narrative for the CEO
  projection: {
    trend: "STABLE" | "IMPROVING" | "DETERIORATING";
    predictedChurnDate?: string;
    timeWindow?: string; // e.g. "48h"
    scenario?: string; // e.g. "Attrition imminente"
    predictedLoss?: string; // e.g. "5000€"
  };
}

// ==========================================
// CONFIGURATION DU MOTEUR
// ==========================================

const DOMAIN_WEIGHTS: Record<BrainSignalDomain, number> = {
  FINANCIAL: 2.0,   // L'argent est le facteur #1
  ENGAGEMENT: 1.5,  // Le comportement prédit l'avenir
  CONTRACT: 1.2,    // Le cadre légal (War Room etc)
  SYSTEMIC: 0.5,    // Contexte global (faible impact individuel)
  HISTORICAL: 0.8   // Le passé éclaire mais ne détermine pas tout
};

const BASE_VOLATILITY = 10; // Volatilité de base (incertitude naturelle)

// ==========================================
// CVI ENGINE
// ==========================================

export const CVIEngine: IntelligenceEngine = {
  id: "CVI-V1",
  name: "Contract Volatility Index Engine",
  version: "1.0.0",

  process(params: StartParams): EngineResult<CVIOutput> {
    const { entity, signals: inputSignals, context } = params;
    
    // 1. CAST & VALIDATION
    // Ce moteur ne traite que les Studies pour le moment
    const study = entity as unknown as Study; // Cast "sale" but necessary here as BrainEntity is generic
    if (entity.type !== 'study') {
        throw new Error("CVI Engine only accepts 'study' entities.");
    }

    // 2. SIGNAL AGGREGATION (Consumation des détecteurs)
    // On génère les signaux frais à partir des détecteurs
    const detectedSignals = [
      ...detectFinancialSignals(study),
      ...detectEngagementSignals(study),
      ...detectContractSignals(study)
      // On pourrait ajouter inputSignals (externes) ici si besoin
    ];

    const allSignals = [...detectedSignals, ...inputSignals];

    // 3. SCORING & WEIGHTING
    let totalScore = BASE_VOLATILITY;
    const domainImpacts: Record<BrainSignalDomain, number> = {
      FINANCIAL: 0,
      ENGAGEMENT: 0,
      CONTRACT: 0,
      HISTORICAL: 0,
      SYSTEMIC: 0
    };

    allSignals.forEach(sig => {
      const weight = DOMAIN_WEIGHTS[sig.domain] || 1.0;
      // Score = Sévérité (0-1) * 20 (base 100) * Poids
      // Ex: Acompte Late (0.8) * 20 * 2.0 = +32 points de CVI
      const impact = sig.severity * 20 * weight;
      
      totalScore += impact;
      domainImpacts[sig.domain] += impact;
    });

    // Caping 0-100
    const cviScore = Math.max(0, Math.min(100, Math.round(totalScore)));

    // 4. ANALYSE DES DRIVERS
    const dominantDrivers = (Object.keys(domainImpacts) as BrainSignalDomain[])
      .sort((a, b) => domainImpacts[b] - domainImpacts[a])
      .filter(d => domainImpacts[d] > 5) // Garde uniquement ceux qui ont un impact significatif
      .slice(0, 3); // Top 3

    // 5. DÉTERMINATION DU STATUT
    let status: CVIOutput['status'] = "STABLE";
    if (cviScore >= 80) status = "LOST";
    else if (cviScore >= 50) status = "CRITICAL";
    else if (cviScore >= 30) status = "VOLATILE";

    // 6. PROJECTION (Tendance)
    const hasAgitation = allSignals.some(s => s.code === SIGNALS_CATALOG.ENGAGEMENT_AGITATED.code);
    const hasFinancialIssues = allSignals.some(s => s.domain === 'FINANCIAL' && s.severity > 0.5);
    
    let trend: CVIOutput['projection']['trend'] = "STABLE";
    if (hasFinancialIssues) trend = "DETERIORATING"; // L'argent est un signe avancé
    else if (hasAgitation) trend = "DETERIORATING"; // L'agitation précède l'action
    else if (status === 'STABLE' && cviScore < 20) trend = "IMPROVING";

    // 7A. HIERARCHY & IMPACT CALCULATION
    const weightedSignals = allSignals.map(sig => {
        const weight = DOMAIN_WEIGHTS[sig.domain] || 1.0;
        const impact = sig.severity * 20 * weight;
        
        let category = "CONTEXTUAL";
        if (impact >= 30) category = "PRIMARY"; // High impact
        else if (impact >= 15) category = "SECONDARY"; // Medium impact

        return {
            ...sig,
            strategy: {
                impact: Math.round(impact),
                category,
                reason: `${category} Driver due to ${sig.domain} weight (x${weight})`
            }
        };
    }).sort((a, b) => b.strategy.impact - a.strategy.impact);

    // 7. CONFIANCE SYSTÈME
    const totalConfidence = weightedSignals.reduce((sum, s) => sum + s.confidence, 0);
    const systemConfidence = weightedSignals.length > 0 ? totalConfidence / weightedSignals.length : 0.5;

    // 7B. EXECUTIVE NARRATIVE GENERATION
    let executiveSummary = "Le système fonctionne dans les paramètres nominaux.";
    if (status === 'CRITICAL' || status === 'LOST') {
        if (hasFinancialIssues) {
            executiveSummary = "Risque de solvabilité financière détecté. Le schéma de non-paiement suggère une rupture de contrat imminente.";
        } else if (dominantDrivers.includes('ENGAGEMENT')) {
            executiveSummary = "Scénario de désengagement sévère. Le manque de réactivité indique une forte probabilité de désistement.";
        } else {
            executiveSummary = "Instabilité critique détectée dans plusieurs domaines. Audit immédiat requis.";
        }
    } else if (status === 'VOLATILE') {
         if (hasAgitation) {
             executiveSummary = "Comportement agité observé. Le client est actif mais ne convertit pas - Opportunité d'intervention.";
         } else if (dominantDrivers.includes('CONTRACT')) {
             executiveSummary = "Friction contractuelle détectée. Les délais pré-signature s'accumulent.";
         } else {
             executiveSummary = "Volatilité détectée. Surveiller toute détérioration.";
         }
    }

    // 7D. PREDICTIVE SCENARIO MODELING (The "Crystal Ball")
    let scenario = "Maintien de l'État Stable";
    let timeWindow = "Indéfinie";
    let predictedLoss = "Neutre";

    if (status === 'CRITICAL' || status === 'LOST') {
        timeWindow = "48/72 HEURES";
        if (hasFinancialIssues) {
            scenario = "RÉSILIATION DE CONTRAT & LITIGE";
            predictedLoss = "VALEUR TOTALE DU CONTRAT (100%)";
        } else {
             scenario = "ATTRITION DÉFINITIVE / PASSAGE CONCURRENCE";
             predictedLoss = "FLUX DE REVENUS FUTURS";
        }
    } else if (status === 'VOLATILE') {
        timeWindow = "2 SEMAINES";
         if (hasAgitation) {
             scenario = "ÉPUISEMENT DE L'ENGAGEMENT";
             predictedLoss = "COÛT D'OPPORTUNITÉ";
         } else if (dominantDrivers.includes('CONTRACT')) {
             scenario = "IMPASSE ADMINISTRATIVE";
             predictedLoss = "REVENUS DIFFÉRÉS";
         } else {
             scenario = "ÉROSION GRADUELLE";
         }
    }

    // 7C. REASONING LOGS GENERATION
    const reasoningLogs = [
        `Volatilité de base : ${BASE_VOLATILITY}`,
        ...weightedSignals.map(s => `Signal [${s.code}] impact : +${s.strategy.impact} (${s.strategy.category})`),
        `Résumé Exécutif : ${executiveSummary}`,
        `Scénario Projeté : ${scenario} sous ${timeWindow}`
    ];

    // 8. OUTPUT CONSTRUCTION
    return {
      engineId: this.id,
      score: cviScore,
      confidence: systemConfidence,
      output: {
        cviScore,
        status,
        dominantDrivers,
        activeSignals: weightedSignals as any,
        systemConfidence,
        executiveSummary,
        projection: {
          trend,
          timeWindow,
          scenario,
          predictedLoss
        } as any, // Cast specific projection extension
        reasoning: reasoningLogs 
      },
      reasoning: reasoningLogs
    };
  }
};
