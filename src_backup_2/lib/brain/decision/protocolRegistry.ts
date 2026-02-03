export type ProtocolOwner = "System" | "Human";

export interface ProtocolStep {
    order: number;
    action: string;
    owner: ProtocolOwner;
    detail?: string;
}

export interface BusinessProtocol {
    id: string;
    name: string;
    objective: string;
    triggers: {
        status?: string[];
        minCvi?: number;
        requiredSignals?: string[];
    };
    steps: ProtocolStep[];
    criticalWindow: string;
    riskOfFailure: string;
    successKPI: string; // <--- NEW
}

export const PROTOCOL_REGISTRY: Record<string, BusinessProtocol> = {
    "PROT-RED-SOLVENCY": {
        id: "PROT-RED-SOLVENCY",
        name: "PROTOCOLE-ROUGE-SOLVABILITÉ",
        objective: "Sécuriser le Paiement Immédiat",
        triggers: {
            status: ["signed"],
            requiredSignals: ["FINANCIAL.DEPOSIT.LATE"]
        },
        steps: [
            { order: 1, action: "Désactiver les accès au portail de {{CLIENT_NAME}}", owner: "System" },
            { order: 2, action: "Envoi Mise en Demeure (Solde: {{AMOUNT}}€)", owner: "System" },
            { order: 3, action: "Appel de Recouvrement (Direction Financière)", owner: "Human" }
        ],
        criticalWindow: "4 HEURES",
        riskOfFailure: "Créance Irrécouvrable",
        successKPI: "Paiement reçu sous 4h"
    },
    "PROT-BLACK-GHOST": {
        id: "PROT-BLACK-GHOST",
        name: "PROTOCOLE-NOIR-FIN-DE-SIGNAL",
        objective: "Rétablir le Contact Client",
        triggers: {
            status: ["signed"],
            minCvi: 40
        },
        steps: [
            { order: 1, action: "Vérifier activité LinkedIn de {{CLIENT_NAME}}", owner: "System" },
            { order: 2, action: "Envoi Email 'CEO to CEO' de rupture de signal", owner: "Human" },
            { order: 3, action: "Relance Téléphonique Directe", owner: "Human" }
        ],
        criticalWindow: "24 HEURES",
        riskOfFailure: "Résiliation Silencieuse",
        successKPI: "Session de vue active détectée"
    },
    "PROT-GOLD-RUSH": {
        id: "PROT-GOLD-RUSH",
        name: "PROTOCOLE-OR-SIGNATURE-EXPRESS",
        objective: "Transformer l'Intérêt en Vente",
        triggers: {
            status: ["sent", "draft"],
            requiredSignals: ["ENGAGEMENT.VIEW.FREQUENT"]
        },
        steps: [
            { order: 1, action: "Générer Offre Bonus 'Réactivité' pour {{CLIENT_NAME}}", owner: "System" },
            { order: 2, action: "Appel Flash : Support de lecture", owner: "Human" }
        ],
        criticalWindow: "2 HEURES",
        riskOfFailure: "Perte du Momentum",
        successKPI: "Signature sous 48h"
    },
    // --- NEW LEADS PROTOCOLS ---
    "LEAD-CONTACT-SPEED": {
        id: "LEAD-CONTACT-SPEED",
        name: "CONTACT-ÉCLAIR-QUALIFICATION",
        objective: "Maximiser le Taux de Transformation",
        triggers: { status: ["new_lead"] },
        steps: [
            { order: 1, action: "Envoi SMS Confirmation à {{CLIENT_NAME}}", owner: "System" },
            { order: 2, action: "Appel de Qualification Immédiat", owner: "Human" }
        ],
        criticalWindow: "15 MIN",
        riskOfFailure: "Refroidissement du Lead",
        successKPI: "Qualification Terminée"
    },
    "LEAD-PHOENIX": {
        id: "LEAD-PHOENIX",
        name: "RÉACTIVATION-PHOENIX-STOCKS",
        objective: "Récupérer du CA sur Prospect Dormant",
        triggers: { requiredSignals: ["ENGAGEMENT.REAWAKENED"] },
        steps: [
            { order: 1, action: "Envoi Document 'Nouveautés 2026' personnalisé", owner: "System" },
            { order: 2, action: "Appel de Courtoisie / Prise de température", owner: "Human" }
        ],
        criticalWindow: "4 HEURES",
        riskOfFailure: "Nouvelle Mise en Sommeil",
        successKPI: "Retour en Pipeline Actif"
    },
    // --- NEW CONVERSION PROTOCOLS ---
    "CONV-FRICTION": {
        id: "CONV-FRICTION",
        name: "DIAGNOSTIC-FRICTION-BLOQUAGE",
        objective: "Lever les Objections Non-Dites",
        triggers: { requiredSignals: ["ENGAGEMENT.ANOMALY.HIGH_VIEWS"] },
        steps: [
            { order: 1, action: "Préparer Comparatif Technique pour {{CLIENT_NAME}}", owner: "System" },
            { order: 2, action: "Appel 'Audit de Besoin' par Senior Sales", owner: "Human" }
        ],
        criticalWindow: "48 HEURES",
        riskOfFailure: "Abandon Silencieux",
        successKPI: "Levée de l'Objection"
    },
    "CONV-URGENCY": {
        id: "CONV-URGENCY",
        name: "OFFRE-EXPIRANTE-URGENCE",
        objective: "Forcer la Décision sur Pipe Stagnant",
        triggers: { requiredSignals: ["ENGAGEMENT.STAGNATION"] },
        steps: [
            { order: 1, action: "Envoi Alerte 'Fin de Validité de l'Offre'", owner: "System" },
            { order: 2, action: "Relance Téléphonique de Clôture", owner: "Human" }
        ],
        criticalWindow: "24 HEURES",
        riskOfFailure: "Dossier Sans Issue",
        successKPI: "Décision Ferme (Sig/Perd)"
    },
    // --- NEW RETENTION PROTOCOLS ---
    "RET-AMBASSADOR": {
        id: "RET-AMBASSADOR",
        name: "ACTIVATION-AMBASSADEUR-PARRAIN",
        objective: "Générer du Nouveau Flux via Satisfaction",
        triggers: { requiredSignals: ["ENGAGEMENT.ACTIVE.POWER_USER"] },
        steps: [
            { order: 1, action: "Envoi Pack 'Ambassadeur Privilège'", owner: "System" },
            { order: 2, action: "Appel Offre de Parrainage", owner: "Human" }
        ],
        criticalWindow: "7 JOURS",
        riskOfFailure: "Opportunité de Growth Manquée",
        successKPI: "1 Nouveau Lead Parrainé"
    },
    "RET-EXPRESS-ONBOARDING": {
        id: "RET-EXPRESS-ONBOARDING",
        name: "VALIDATION-EXPRESS-ONBOARDING",
        objective: "Accélérer le Démarrage Technique",
        triggers: { requiredSignals: ["CONTRACT.ADMIN.PENDING"] },
        steps: [
            { order: 1, action: "Planifier Séance Visio 'Assistance Administrative'", owner: "System" },
            { order: 2, action: "Support Vidéo personnalisé à {{CLIENT_NAME}}", owner: "Human" }
        ],
        criticalWindow: "48 HEURES",
        riskOfFailure: "Lassitude Administrative",
        successKPI: "Dossier 100% Complet"
    }
};
