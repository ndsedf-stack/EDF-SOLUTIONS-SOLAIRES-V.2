import { BrainSignalDomain } from "./types";

/**
 * SIGNAL CATALOG
 * Central registry of all known signals in the system.
 */

export interface SignalDefinition {
    code: string;
    domain: BrainSignalDomain;
    label: string;
    defaultSeverity: number;
}

export const SIGNALS_CATALOG = {
    // === FINANCIAL ===
    FINANCIAL_DEPOSIT_PENDING: {
        code: "FINANCIAL.DEPOSIT.PENDING",
        domain: "FINANCIAL",
        label: "Acompte en attente",
        defaultSeverity: 0.5
    },
    FINANCIAL_DEPOSIT_LATE: {
        code: "FINANCIAL.DEPOSIT.LATE",
        domain: "FINANCIAL",
        label: "Retard Acompte",
        defaultSeverity: 0.8
    },

    // === ENGAGEMENT ===
    ENGAGEMENT_MUTED: {
        code: "ENGAGEMENT.INTERACTION.MUTED",
        domain: "ENGAGEMENT",
        label: "Client Muet",
        defaultSeverity: 0.3
    },
    ENGAGEMENT_FATIGUE: {
        code: "ENGAGEMENT.INTERACTION.FATIGUE",
        domain: "ENGAGEMENT",
        label: "Client Fatigué",
        defaultSeverity: 0.7
    },
    ENGAGEMENT_AGITATED: {
        code: "ENGAGEMENT.INTERACTION.AGITATED",
        domain: "ENGAGEMENT",
        label: "Comportement Agité",
        defaultSeverity: 0.6
    },
    ENGAGEMENT_ANOMALY_HIGH_VIEWS: {
        code: "ENGAGEMENT.ANOMALY.HIGH_VIEWS",
        domain: "ENGAGEMENT",
        label: "Anomalie Vues",
        defaultSeverity: 0.4
    },
    ENGAGEMENT_ANOMALY_LOW_VIEWS: {
        code: "ENGAGEMENT.ANOMALY.LOW_VIEWS",
        domain: "ENGAGEMENT",
        label: "Anomalie Signature",
        defaultSeverity: 0.5
    },
    ENGAGEMENT_VIEW_FREQUENT: {
        code: "ENGAGEMENT.VIEW.FREQUENT",
        domain: "ENGAGEMENT",
        label: "Signature Imminente (Gold Rush)",
        defaultSeverity: 0.2
    },
    ENGAGEMENT_STAGNATION: {
        code: "ENGAGEMENT.STAGNATION",
        domain: "ENGAGEMENT",
        label: "Pipeline Stagnant",
        defaultSeverity: 0.6
    },
    ENGAGEMENT_REAWAKENED: {
        code: "ENGAGEMENT.REAWAKENED",
        domain: "ENGAGEMENT",
        label: "Réveil Phoenix",
        defaultSeverity: 0.1
    },
    ENGAGEMENT_ACTIVE_POWER_USER: {
        code: "ENGAGEMENT.ACTIVE.POWER_USER",
        domain: "ENGAGEMENT",
        label: "Utilisateur Actif (Ambassadeur)",
        defaultSeverity: 0.1
    },
    ENGAGEMENT_LOW_ACTIVITY: {
        code: "ENGAGEMENT.LOW_ACTIVITY",
        domain: "ENGAGEMENT",
        label: "Baisse d'engagement",
        defaultSeverity: 0.4
    },
    ENGAGEMENT_ANOMALY_GHOSTING: {
        code: "ENGAGEMENT.ANOMALY.GHOSTING",
        domain: "ENGAGEMENT",
        label: "Ghosting Détecté",
        defaultSeverity: 0.8
    },

    // === CONTRACT ===
    CONTRACT_SIGNED: {
        code: "CONTRACT.STATUS.SIGNED",
        domain: "CONTRACT",
        label: "Contrat Signé",
        defaultSeverity: 0.0
    },
    CONTRACT_WARROOM_CANDIDATE: {
        code: "CONTRACT.RISK.WAR_ROOM_CANDIDATE",
        domain: "CONTRACT",
        label: "Candidat War Room",
        defaultSeverity: 0.8
    },
    CONTRACT_ADMIN_PENDING: {
        code: "CONTRACT.ADMIN.PENDING",
        domain: "CONTRACT",
        label: "Onboarding Administratif",
        defaultSeverity: 0.3
    },
    CONTRACT_RISK_EXPIRING_LEGAL: {
        code: "CONTRACT.RISK.EXPIRING_LEGAL",
        domain: "CONTRACT",
        label: "Échéance Légale Imminente",
        defaultSeverity: 0.9
    },
    SYSTEM_NEW_ENTRY: {
        code: "SYSTEM.NEW_ENTRY",
        domain: "SYSTEMIC",
        label: "Nouvelle Entrée Système",
        defaultSeverity: 0.1
    }
} as const;

export type SignalCode = typeof SIGNALS_CATALOG[keyof typeof SIGNALS_CATALOG]["code"];
