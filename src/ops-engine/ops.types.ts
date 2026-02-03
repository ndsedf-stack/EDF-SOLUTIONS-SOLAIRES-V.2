
export type SystemStatus = "stable" | "tension" | "critical";

export type WarRoomTrigger =
  | "deadline_proche"
  | "silence_prolonge"
  | "comportement_suspect"
  | "acompte_manquant";

export type RecommendationAction =
  | "appel_urgence"
  | "mail_manuel"
  | "verification_tech"
  | "freeze_dossier";

export interface OpsStudyState {
  id: string;
  name: string;
  totalPrice: number;
  signedAt?: string;
  depositPaid: boolean;
  daysLate: number;
  lastInteraction: string | null;
  behaviorScore: number; // 0-100
}

export interface OpsAlert {
  id: string;
  studyId: string;
  type: WarRoomTrigger;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  recommendation: RecommendationAction;
  timestamp: string;
}


export interface OpsDashboardState {
  status: SystemStatus;
  cashExposed: number;
  warRoomCount: number;
  alerts: OpsAlert[];
}

// === SNAPSHOT TYPES (DB MIRROR) ===
export type OpsSnapshotRow = {
  study_id: string;
  ops_state:
    | 'ACTIVE'
    | 'SECURED'
    | 'UNSECURED_DELAY'
    | 'SILENT'
    | 'SRU_EXPIRED';

  days_since_signature: number | null;
  days_since_last_event: number | null;

  deposit_paid: boolean;
  signed_at: string | null;
  last_interaction_at: string | null;
  
  // Champs additionnels (si présents dans la vue)
  install_cost?: number;
  status?: string;
  interaction_score?: number;
  email_optout?: boolean;
};

export type OpsScoringResult = {
  study_id: string;
  risk_score_ops: number;
  inertia_score: number;
  ops_health_score: number;
};
