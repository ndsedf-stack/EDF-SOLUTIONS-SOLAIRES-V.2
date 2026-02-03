
export type UserProfile =
  | "rationnel"
  | "banquier"
  | "prudent"
  | "emotionnel";

export type DecisionState =
  | "DISCOVERY"
  | "STRUCTURATION"
  | "CONFRONTATION"
  | "LUCIDITY_POINT"
  | "DECISION_OPEN"
  | "SECURED";

export interface AgentZeroInput {
  user: {
    profile: UserProfile;
    engagementLevel: number;
    fatigueScore: number;
  };

  session: {
    timeSpent: number;
    scrollDepth: number;
    openedModules: string[];
    closedModules: string[];
    idleMoments: number;
  };

  decision: {
    hasSeenCoreProofs: boolean;
    hasSeenBudgetModule: boolean;
    hasSeenProjection: boolean;
    hasOpenedDetailsAccordion: boolean;
    hasReachedDecisionAnchor: boolean;
    hasClickedSign: boolean;
    isSigned: boolean;
  };

  riskSignals: {
    hesitationLoops: number;
    backwardScrolls: number;
    popupObjectionsOpened: string[];
  };
}

export interface AgentZeroDecision {
  state: DecisionState;

  permissions: Record<string, boolean>;
  locks: Record<string, boolean>;
  nudges: string[];

  audit: {
    timestamp: number;
    state: DecisionState;
    modulesSeen: string[];
    objectionsOpened: string[];
    decisionContext: Record<string, boolean>;
    decisionHash: string;
  };
}
