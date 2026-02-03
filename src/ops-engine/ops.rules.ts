/**
 * OPS RULES
 * Source de vérité métier – Gouvernance interne
 * ⚠️ Aucun calcul ici
 * ⚠️ Aucun effet de bord
 */

/* =========================
   TEMPS & DÉLAIS
========================= */

export const SRU_MAX_DAYS = 14;              // délai légal de rétractation
export const SILENCE_THRESHOLD_DAYS = 7;     // client considéré muet
export const LATE_DEPOSIT_DAYS = 10;         // acompte en retard critique

/* =========================
   RISQUE & SEUILS
========================= */

export const WAR_ROOM_RISK_SCORE = 0.6;      // seuil unique WAR ROOM
export const UI_DANGER_SCORE = 70;           // legacy UI (mapping visuel)

export const EXPOSURE_WARNING_RATIO = 0.2;   // cockpit tension
export const EXPOSURE_CRITICAL_RATIO = 0.35; // cockpit critique

/**
 * 🔒 RÈGLE STRICTE WAR ROOM (DERIVATION)
 * is_war_room n'est JAMAIS écrit manuellement.
 * C'est une conséquence directe de :
 * is_war_room = (ops_state === 'SRU_EXPIRED' || ops_state === 'UNSECURED_DELAY')
 */

/* =========================
   FINANCIER
========================= */

export const HIGH_AMOUNT_THRESHOLD = 30000;  // seuil psychologique client

/* =========================
   BONUS / MALUS DE RISQUE
========================= */

export const RISK_BONUS = {
  DEPOSIT_RECEIVED: -0.15,
  HIGH_INTERACTION: -0.10,
};

export const RISK_PENALTY = {
  NO_DEPOSIT_EARLY: 0.10,
  NO_DEPOSIT_LATE: 0.25,
  SILENCE_LOW: 0.10,
  SILENCE_CRITICAL: 0.20,
  HIGH_AMOUNT: 0.08,
  SRU_DANGER_ZONE: 0.35,
};
