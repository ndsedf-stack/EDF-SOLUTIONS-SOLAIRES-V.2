import { BusinessProtocol } from "./protocolTypes";

export const PROTOCOL_LIBRARY: Record<string, BusinessProtocol> = {
    // === CATÉGORIE 1 : SÉCURISER LES CLIENTS SIGNÉS ===
    
    "PROT-S1": {
        id: "PROT-S1",
        name: "S1 — RÉCUPÉRATION D’ACOMPTE",
        objective: "Sécuriser l’acompte sur un contrat signé.",
        category: "SÉCURISATION",
        urgency: "CRITICAL",
        triggers: {
            crmStatus: ["signed"],
            requiredSignals: ["FINANCIAL.DEPOSIT.LATE", "ENGAGEMENT.LOW_ACTIVITY"]
        },
        steps: [
            { order: 1, label: "📞 Appel client prioritaire (Vérifier intention/blocage)", owner: "HUMAN", actionType: "CALL" },
            { order: 2, label: "📩 Envoi mail pré-rédigé (Récap + Lien Paiement)", owner: "SYSTEM", actionType: "EMAIL" },
            { order: 3, label: "🗓 Programmation automatique d'un rappel (24h/48h)", owner: "SYSTEM", actionType: "TASK" }
        ],
        successMetrics: {
            kpiName: "Acompte reçu / Réponse client",
            targetValue: "100% Acompte",
            timeframe: "48h"
        },
        riskOfFailure: "Entrée en zone d’annulation, perte de contrat réel."
    },

    "PROT-S2": {
        id: "PROT-S2",
        name: "S2 — CLIENT MUET POST-SIGNATURE",
        objective: "Réactiver le contact et confirmer l’engagement.",
        category: "SÉCURISATION",
        urgency: "HIGH",
        triggers: {
            crmStatus: ["signed"],
            requiredSignals: ["ENGAGEMENT.ANOMALY.GHOSTING"]
        },
        steps: [
            { order: 1, label: "📩 Mail court humain (Vérifier que tout est ok)", owner: "HUMAN", actionType: "EMAIL" },
            { order: 2, label: "📞 Appel de courtoisie (Clarification, pas vente)", owner: "HUMAN", actionType: "CALL" },
            { order: 3, label: "📄 Rappel du livrable / planning concret", owner: "HUMAN", actionType: "TASK" }
        ],
        successMetrics: {
            kpiName: "Reprise de contact / Activité",
            targetValue: "Contact Rétabli",
            timeframe: "72h"
        },
        riskOfFailure: "Désengagement silencieux et rétractation."
    },

    "PROT-S3": {
        id: "PROT-S3",
        name: "S3 — CLIENT AGITÉ (Hyper-consultation)",
        objective: "Lever un blocage psychologique ou décisionnel.",
        category: "SÉCURISATION",
        urgency: "MEDIUM",
        triggers: {
            crmStatus: ["signed", "hot_prospect"],
            requiredSignals: ["ENGAGEMENT.VIEW.FREQUENT", "ENGAGEMENT.ANOMALY.HIGH_VIEWS"]
        },
        steps: [
            { order: 1, label: "📞 Appel ciblé (Qu'est-ce qui bloque aujourd'hui ?)", owner: "HUMAN", actionType: "CALL" },
            { order: 2, label: "📩 Mail personnalisé (Répondre aux pages vues)", owner: "HUMAN", actionType: "EMAIL" },
            { order: 3, label: "🎯 Proposition claire (Étape suivante + Date unique)", owner: "HUMAN", actionType: "TASK" }
        ],
        successMetrics: {
            kpiName: "Verbalisation du frein / Progression",
            targetValue: "Validation Étape",
            timeframe: "48h"
        },
        riskOfFailure: "Anxiété client bloquante."
    },

    "PROT-S4": {
        id: "PROT-S4",
        name: "S4 — CONTRAT À FENÊTRE CRITIQUE",
        objective: "Empêcher une annulation automatique.",
        category: "SÉCURISATION",
        urgency: "CRITICAL",
        triggers: {
            crmStatus: ["signed"],
            requiredSignals: ["CONTRACT.RISK.EXPIRING_LEGAL"]
        },
        steps: [
            { order: 1, label: "⚠️ Alerte War Room Max Priority", owner: "SYSTEM", actionType: "SYSTEM_BLOCK" },
            { order: 2, label: "📞 Appel prioritaire immédiat", owner: "HUMAN", actionType: "CALL" },
            { order: 3, label: "📩 Mail + Lien + Synthèse d'urgence", owner: "SYSTEM", actionType: "EMAIL" }
        ],
        successMetrics: {
            kpiName: "Sécurisation / Sortie zone critique",
            targetValue: "Zone Sécurisée",
            timeframe: "24h"
        },
        riskOfFailure: "Annulation légale automatique."
    },

    // === CATÉGORIE 2 : FAIRE SIGNER LES PROSPECTS CHAUDS ===

    "PROT-P1": {
        id: "PROT-P1",
        name: "P1 — PROSPECT CHAUD À CLÔTURER",
        objective: "Transformer l'intérêt en signature.",
        category: "CONVERSION",
        urgency: "HIGH",
        triggers: {
            crmStatus: ["prospect", "sent"],
            requiredSignals: ["ENGAGEMENT.VIEW.FREQUENT"]
        },
        steps: [
            { order: 1, label: "📞 Appel closing (Valider intérêt / Lever freins)", owner: "HUMAN", actionType: "CALL" },
            { order: 2, label: "📩 Mail de synthèse (Valeur + Prochaines étapes)", owner: "SYSTEM", actionType: "EMAIL" },
            { order: 3, label: "✍️ Envoi lien de signature prioritaire", owner: "SYSTEM", actionType: "TASK" }
        ],
        successMetrics: {
            kpiName: "Signature / Décision",
            targetValue: "Contrat Signé",
            timeframe: "48h"
        },
        riskOfFailure: "Perte du momentum émotionnel."
    },

    "PROT-P2": {
        id: "PROT-P2",
        name: "P2 — PROSPECT ENGAGÉ MAIS LENT",
        objective: "Accélérer sans pression.",
        category: "CONVERSION",
        urgency: "MEDIUM",
        triggers: {
            crmStatus: ["prospect", "sent"],
            requiredSignals: ["ENGAGEMENT.STAGNATION"]
        },
        steps: [
            { order: 1, label: "📩 Mail ‘aide à la décision’ (FAQ + Témoignage)", owner: "SYSTEM", actionType: "EMAIL" },
            { order: 2, label: "📞 Appel soft de suivi", owner: "HUMAN", actionType: "CALL" },
            { order: 3, label: "🗓 Rappel intelligent à J+3", owner: "SYSTEM", actionType: "TASK" }
        ],
        successMetrics: {
            kpiName: "Réponse / Call planifié",
            targetValue: "Réponse Active",
            timeframe: "7 jours"
        },
        riskOfFailure: "Endormissement du dossier."
    },

    "PROT-P3": {
        id: "PROT-P3",
        name: "P3 — PROSPECT QUI S’ÉTEINT",
        objective: "Récupérer ou qualifier la perte.",
        category: "CONVERSION",
        urgency: "LOW",
        triggers: {
            crmStatus: ["prospect", "sent"],
            requiredSignals: ["ENGAGEMENT.ANOMALY.GHOSTING"]
        },
        steps: [
            { order: 1, label: "📩 Mail court (Toujours d'actualité ?)", owner: "SYSTEM", actionType: "EMAIL" },
            { order: 2, label: "📞 Appel unique de qualification", owner: "HUMAN", actionType: "CALL" },
            { order: 3, label: "🏷 Changement de statut (Froid / Perdu)", owner: "HUMAN", actionType: "TASK" }
        ],
        successMetrics: {
            kpiName: "Réponse / Qualification",
            targetValue: "Statut Défini",
            timeframe: "14 jours"
        },
        riskOfFailure: "Pollution du pipe par dossiers morts."
    },

    // === CATÉGORIE 3 : TRANSFORMER DES LEADS EN RDV ===

    "PROT-L1": {
        id: "PROT-L1",
        name: "L1 — ACTIVATION LEAD",
        objective: "Créer un premier échange.",
        category: "ACQUISITION",
        urgency: "HIGH",
        triggers: {
            crmStatus: ["lead", "new_lead"],
            requiredSignals: ["SYSTEM.NEW_ENTRY"]
        },
        steps: [
            { order: 1, label: "📩 Mail d'accueil (Valeur + Question simple)", owner: "SYSTEM", actionType: "EMAIL" },
            { order: 2, label: "📞 Appel court de prise de contact", owner: "HUMAN", actionType: "CALL" },
            { order: 3, label: "🗓 Proposition de créneau RDV", owner: "HUMAN", actionType: "TASK" }
        ],
        successMetrics: {
            kpiName: "Réponse / RDV Pris",
            targetValue: "Meeting Planifié",
            timeframe: "24h"
        },
        riskOfFailure: "Vaporisation du lead par manque de réactivité."
    },

    "PROT-L2": {
        id: "PROT-L2",
        name: "L2 — LEAD ENGAGÉ",
        objective: "Transformer en opportunité.",
        category: "ACQUISITION",
        urgency: "MEDIUM",
        triggers: {
            crmStatus: ["lead"],
            requiredSignals: ["ENGAGEMENT.REAWAKENED"]
        },
        steps: [
            { order: 1, label: "📩 Mail personnalisé (Basé sur ce qu'il a vu)", owner: "SYSTEM", actionType: "EMAIL" },
            { order: 2, label: "📞 Appel de qualification profonde", owner: "HUMAN", actionType: "CALL" },
            { order: 3, label: "🎯 Proposition claire d'accompagnement", owner: "HUMAN", actionType: "TASK" }
        ],
        successMetrics: {
            kpiName: "Call / Qualification",
            targetValue: "Passage en Prospect",
            timeframe: "72h"
        },
        riskOfFailure: "Manque de personnalisation."
    },

    "PROT-L3": {
        id: "PROT-L3",
        name: "L3 — LEAD SILENCIEUX",
        objective: "Relancer ou nettoyer.",
        category: "ACQUISITION",
        urgency: "LOW",
        triggers: {
            crmStatus: ["lead"],
            requiredSignals: ["ENGAGEMENT.ANOMALY.GHOSTING"]
        },
        steps: [
            { order: 1, label: "📩 Relance légère de suivi", owner: "SYSTEM", actionType: "EMAIL" },
            { order: 2, label: "📩 Dernier message d'intérêt", owner: "SYSTEM", actionType: "EMAIL" },
            { order: 3, label: "🏷 Archivage automatique", owner: "SYSTEM", actionType: "TASK" }
        ],
        successMetrics: {
            kpiName: "Réponse / Nettoyage base",
            targetValue: "Pipeline Propre",
            timeframe: "30 jours"
        },
        riskOfFailure: "Bruit inutile dans le CRM."
    }
};
