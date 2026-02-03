
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
