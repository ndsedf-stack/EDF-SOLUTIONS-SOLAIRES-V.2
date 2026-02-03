import { Study } from "@/brain/types";

// ============================================
// TYPES
// ============================================

export interface SecuredContract {
  id: string;
  client_name: string;
  client_email?: string;
  amount: number;
  signed_at: string;
  days_since_signature: number;
  legal_lock_date: string;
  deposit_received: boolean;
  deposit_amount: number;
  last_client_activity: string | null;
  interaction_score: number; // 0-100
  historical_cancel_rate: number; // 0-1
  cancellation_risk_score: number; // 0-1
  financial_weight: number; // % du CA total
  status_layer: 'locked' | 'exposed' | 'danger';
  payment_method: string;
  current_step: number;
  last_step_date: string | null;
}

export interface ContractKPIs {
  ca_locked: number;
  ca_exposed: number;
  ca_at_risk: number;
  potential_loss: number;
  locked_percentage: number;
  exposed_percentage: number;
  risk_percentage: number;
  average_exposure: number;
  solidity_index: number;
  solidity_7d: number;
  solidity_drift: number;
  risk_concentration: number;
}

export interface TimeSegment {
  label: string;
  range: string;
  contracts: SecuredContract[];
  count: number;
  amount: number;
  historical_cancel_rate: number;
  danger_level: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================
// CONFIGURATION
// ============================================

const LEGAL_DELAY_DAYS = 14; // Délai légal de rétractation
const HIGH_AMOUNT_THRESHOLD = 30000; // Seuil "gros montant"
const SILENCE_THRESHOLD_DAYS = 7; // Seuil "silence client"

// ============================================
// CALCUL DES SCORES
// ============================================

/**
 * Calcule le score d'interaction client (0-100)
 * Basé sur la récence et la fréquence des interactions
 */
export function calculateInteractionScore(
  lastActivity: string | null,
  views: number,
  clicks: number
): number {
  if (!lastActivity) return 0;
  
  const daysSinceActivity = Math.floor(
    (Date.now() - new Date(lastActivity).getTime()) / 86400000
  );
  
  // Score de récence (0-50)
  const recencyScore = Math.max(0, 50 - daysSinceActivity * 5);
  
  // Score d'engagement (0-50)
  const engagementScore = Math.min(50, (views * 5) + (clicks * 10));
  
  return Math.round(recencyScore + engagementScore);
}

/**
 * Calcule le score de risque d'annulation (0-1)
 * Plus le score est élevé, plus le risque est grand
 * 
 * REBALANCED: Distribution plus réaliste
 */
export function calculateCancellationRisk(contract: {
  days_since_signature: number;
  deposit_received: boolean;
  amount: number;
  interaction_score: number;
}): number {
  let risk = 0;
  
  // Facteur 1: Proximité de la fin du délai légal (REBALANCED)
  if (contract.days_since_signature >= 12 && contract.days_since_signature <= LEGAL_DELAY_DAYS) {
    risk += 0.35; // Très proche de la fin
  } else if (contract.days_since_signature >= 8 && contract.days_since_signature < 12) {
    risk += 0.20; // Approche de la fin
  } else if (contract.days_since_signature >= 4 && contract.days_since_signature < 8) {
    risk += 0.10; // Zone de réflexion
  } else if (contract.days_since_signature < 4) {
    risk += 0.05; // Signature fraîche, faible risque
  }
  // Après J+14: risque minimal (0)
  
  // Facteur 2: Absence d'acompte (REBALANCED)
  if (!contract.deposit_received) {
    if (contract.days_since_signature > 7) {
      risk += 0.25; // Pas d'acompte après 7 jours = risque élevé
    } else {
      risk += 0.10; // Pas encore d'acompte mais c'est tôt
    }
  } else {
    risk -= 0.15; // Bonus: acompte reçu = ancrage fort
  }
  
  // Facteur 3: Montant élevé (REBALANCED - moins pénalisant)
  if (contract.amount > HIGH_AMOUNT_THRESHOLD) {
    risk += 0.08; // Légère augmentation du risque psychologique
  }
  
  // Facteur 4: Interaction client (REBALANCED)
  if (contract.interaction_score < 20) {
    risk += 0.20; // Silence total = très mauvais signe
  } else if (contract.interaction_score < 40) {
    risk += 0.10; // Faible interaction
  } else if (contract.interaction_score >= 60) {
    risk -= 0.10; // Bonus: client engagé
  }
  
  // Limiter entre 0 et 1
  return Math.max(0, Math.min(1, risk));
}

/**
 * Détermine la couche de statut du contrat
 */
export function determineStatusLayer(
  days_since_signature: number,
  deposit_received: boolean,
  cancellation_risk: number
): 'locked' | 'exposed' | 'danger' {
  // Verrouillé: hors délai légal OU acompte reçu
  if (days_since_signature > LEGAL_DELAY_DAYS || deposit_received) {
    return 'locked';
  }
  
  // Danger: risque élevé
  if (cancellation_risk > 0.6) {
    return 'danger';
  }
  
  // Exposé: par défaut
  return 'exposed';
}

/**
 * Calcule l'indice de solidité global (0-100)
 */
export function calculateSolidityIndex(contracts: SecuredContract[]): number {
  if (contracts.length === 0) return 0;
  
  const totalAmount = contracts.reduce((sum, c) => sum + c.amount, 0);
  
  // Pondération par montant
  const weightedSolidity = contracts.reduce((sum, c) => {
    const weight = c.amount / totalAmount;
    const contractSolidity = (1 - c.cancellation_risk_score) * 100;
    return sum + (contractSolidity * weight);
  }, 0);
  
  return Math.round(weightedSolidity);
}

// ============================================
// TRANSFORMATION STUDY → SECUREDCONTRACT
// ============================================

export function transformStudyToContract(
  study: Study,
  totalCA: number
): SecuredContract {
  const daysSince = Math.floor(
    (Date.now() - new Date(study.signed_at || study.created_at).getTime()) / 86400000
  );
  
  const lockDate = new Date(study.signed_at || study.created_at);
  lockDate.setDate(lockDate.getDate() + LEGAL_DELAY_DAYS);
  
  const interactionScore = calculateInteractionScore(
    study.last_open || study.last_view,
    study.views,
    study.clicks
  );
  
  const amount = study.total_price || 0;
  
  const cancellationRisk = calculateCancellationRisk({
    days_since_signature: daysSince,
    deposit_received: study.deposit_paid,
    amount,
    interaction_score: interactionScore,
  });
  
  const statusLayer = determineStatusLayer(
    daysSince,
    study.deposit_paid,
    cancellationRisk
  );
  
  // Determine Payment Label
  let paymentMethod = 'Comptant';
  if (study.financing_mode === 'cash_payment') {
      if (study.deposit_paid || (study.deposit_amount && study.deposit_amount > 0)) {
          paymentMethod = 'CASH + ACOMPTE';
      } else {
          paymentMethod = 'COMPTANT';
      }
  } else if (study.payment_mode === 'financing' || study.deposit_paid) {
      paymentMethod = 'Financé';
  }

  // Determine Step (Mock logic improved or map from real field if exists)
  // Since we don't have explicit 'step' in Study yet, we infer from days or provided field
  // User complained about "j1" so we need something dynamic or strictly tied to days
  const inferredStep = Math.min(5, Math.floor(daysSince / 2) + 1); 

  return {
    id: study.id,
    client_name: study.name,
    client_email: study.email, // ✅ Added
    amount,
    signed_at: study.signed_at || study.created_at,
    days_since_signature: daysSince,
    legal_lock_date: lockDate.toISOString(),
    deposit_received: study.deposit_paid,
    deposit_amount: study.deposit_amount || 0,
    last_client_activity: study.last_open || study.last_view,
    interaction_score: interactionScore,
    historical_cancel_rate: 0.08, // À adapter avec vraies données historiques
    cancellation_risk_score: cancellationRisk,
    financial_weight: totalCA > 0 ? (amount / totalCA) * 100 : 0,
    status_layer: statusLayer,
    payment_method: paymentMethod,
    current_step: inferredStep,
    last_step_date: study.signed_at || study.created_at // Should be last email sent date ideally
  };
}

// ============================================
// AGRÉGATION DES KPIs
// ============================================

export function calculateContractKPIs(contracts: SecuredContract[]): ContractKPIs {
  const ca_locked = contracts
    .filter(c => c.status_layer === 'locked')
    .reduce((sum, c) => sum + c.amount, 0);
  
  const ca_exposed = contracts
    .filter(c => c.status_layer === 'exposed')
    .reduce((sum, c) => sum + c.amount, 0);
  
  const ca_at_risk = contracts
    .filter(c => c.status_layer === 'danger')
    .reduce((sum, c) => sum + c.amount, 0);
  
  const totalCA = ca_locked + ca_exposed + ca_at_risk;
  
  // Perte potentielle pondérée
  const potential_loss = contracts.reduce((sum, c) => {
    return sum + (c.amount * c.cancellation_risk_score * c.historical_cancel_rate);
  }, 0);
  
  // Solidité globale
  const solidity_index = calculateSolidityIndex(contracts);
  
  // Solidité des 7 derniers contrats
  const recent7 = contracts
    .sort((a, b) => new Date(b.signed_at).getTime() - new Date(a.signed_at).getTime())
    .slice(0, 7);
  const solidity_7d = calculateSolidityIndex(recent7);
  
  // Dérive
  const solidity_drift = solidity_7d - solidity_index;
  
  // Concentration du risque (Herfindahl-Hirschman Index adapté)
  const risk_concentration = contracts.reduce((sum, c) => {
    return sum + Math.pow(c.financial_weight, 2);
  }, 0) / 100;
  
  return {
    ca_locked,
    ca_exposed,
    ca_at_risk,
    potential_loss,
    locked_percentage: totalCA > 0 ? (ca_locked / totalCA) * 100 : 0,
    exposed_percentage: totalCA > 0 ? (ca_exposed / totalCA) * 100 : 0,
    risk_percentage: totalCA > 0 ? (ca_at_risk / totalCA) * 100 : 0,
    average_exposure: contracts.length > 0 ? ca_exposed / contracts.length : 0,
    solidity_index,
    solidity_7d,
    solidity_drift,
    risk_concentration,
  };
}

// ============================================
// SEGMENTATION TEMPORELLE
// ============================================

export function segmentContractsByAge(contracts: SecuredContract[]): TimeSegment[] {
  const segments: TimeSegment[] = [
    { label: 'Signature fraîche', range: 'J+0 → J+3', contracts: [], count: 0, amount: 0, historical_cancel_rate: 0.02, danger_level: 'low' },
    { label: 'Réflexion client', range: 'J+4 → J+7', contracts: [], count: 0, amount: 0, historical_cancel_rate: 0.08, danger_level: 'medium' },
    { label: 'Fin de délai', range: 'J+8 → J+14', contracts: [], count: 0, amount: 0, historical_cancel_rate: 0.15, danger_level: 'high' },
    { label: 'Hors délai', range: 'J+15+', contracts: [], count: 0, amount: 0, historical_cancel_rate: 0.01, danger_level: 'low' },
  ];
  
  contracts.forEach(contract => {
    const days = contract.days_since_signature;
    let segmentIndex = 0;
    
    if (days >= 0 && days <= 3) segmentIndex = 0;
    else if (days >= 4 && days <= 7) segmentIndex = 1;
    else if (days >= 8 && days <= 14) segmentIndex = 2;
    else segmentIndex = 3;
    
    segments[segmentIndex].contracts.push(contract);
    segments[segmentIndex].count++;
    segments[segmentIndex].amount += contract.amount;
  });
  
  return segments;
}
