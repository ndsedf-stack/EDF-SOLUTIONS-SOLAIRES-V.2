export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  email_optout: boolean;
}

export interface StudyData {
  installCost?: number;
  address?: string;
  mode?: "cash" | "financement";
  cashApport?: number;
  [key: string]: any;
}

export interface Study {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone?: string;
  status: "draft" | "sent" | "signed" | "cancelled";
  created_at: string;
  signed_at: string | null;
  study_data: StudyData | null; // ✅ Updated type
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_at: string | null;
  views: number;
  clicks: number;
  diffDays: number;
  hasLog: boolean; // ✅ Added missing field
  rib_sent: boolean;
  rib_sent_at: string | null;
  last_open: string | null;
  last_click: string | null;
  last_view: string | null; // ✅ Added missing field
  email_optout: boolean;
  
  // Payment info
  payment_mode: "cash" | "financing" | null;
  payment_type: string | null;
  financing_mode: "full_financing" | "with_deposit" | "cash_payment" | "partial_financing" | null;
  has_deposit: boolean;
  cash_apport: number;
  total_price: number;

  install_cost: number;
  
  // ✅ Brain-Calculated Revenue Fields
  revenue_secured: number;
  revenue_projected: number;
  revenue_gap: number;

  // Guest view URL
  guest_view_url?: string; // ✅ Added for guest view link

  // Calculated/Optional fields
  requiresDeposit?: boolean;
  daysLate?: number;
  daysSinceSigned?: number | null;
  isDepositLate?: boolean;
  
  // Behavior / Brain fields
  behavioralState?: "MUET" | "CAS_LIMITE" | "AGITÉ" | "INTÉRESSÉ" | "STABLE" | "FATIGUE";
  behavioralIcon?: string; // ✅ Added
  behavioralLabel?: string; // ✅ Added
  dangerScore?: number;
  behavior?: string;
  cancellationRisk?: number;
  contract_secured?: boolean;
  cancellation_deadline?: string;
  
  // Tracking
  send_count?: number; 
}

export interface EmailLead {
    id: string;
    client_id: string;
    study_id: string | null;
    client_name: string;
    client_email: string;
    opted_out: boolean;
    email_sequence_step: number;
    last_email_sent: string | null;
    next_email_date: string | null;
    total_opens: number;
    total_clicks: number;
    last_opened_at: string | null;
    last_clicked_at: string | null;
    created_at: string;
  }
  
  export interface DecisionLog {
    id: string;
    study_id?: string;
    client_name: string;
    action_performed: string;
    justification: string;
    created_at: string;
  }
  
  export interface EmailQueue {
    study_id: string;
    client_id: string;
    email_type: string;
    status: "pending" | "sent" | "cancelled";
    sent_at: string | null;
    scheduled_for: string | null;
  }

export type SystemState = "stable" | "active" | "warning" | "critical";

export interface FinancialStats {
  cashSecured: number;
  cashAtRisk: number;
  warRoomCA: number;
  securedCount: number;
  riskCount: number;
  warRoomCount: number;
  lateCount: number;
  lateNames: string;
  nextDeadlineDate: string;
  nextDeadlineClient: string;
  caTotal: number;
  tauxConversion: number;
  // ✅ Nouveaux champs
  cashWaitingDeposit?: number;
  waitingDepositCount?: number;
  cashCancellable?: number;
  cancellableCount?: number;
  // 🚀 RAJOUTS STATS PREMIUM
  cashAtFatigue?: number;
  securedPotential?: number;
}

export interface Metrics {
  signed: Study[];
  sent: Study[];
  healthy: Study[];
  lateDeposits: Study[];
  warRoom: {
    studies: (Study & {
      dangerScore: number;
      behavior: string;
      cancellationRisk: number;
    })[];
    count: number;
    ca: number;
  };
  finance: {
    riskyDeposits: Study[];
    cashAtRisk: number;
  };
  actionNow: (Study & {
    dangerScore?: number;
    cancellationRisk?: number;
    behavior?: string;
  })[];
  behavioral: {
    muets: Study[];
    agites: Study[];
    interesses: Study[];
    fatigues: Study[]; // 🚀 RAJOUT CATEGORIE
  };
  systemState: SystemState;
  priorityCase: any;
  tensionLevel: number;
  priorityActions: any[];
  urgencyMode: {
    active: boolean;
    level: string;
    message: string;
    focus: any;
  };
}

export interface EmailFlow {
    step: number;
    last: string | null;
    next: string | null;
    opens: number;
    clicks: number;
    opted_out: boolean;
  }
  
  export interface AntiAnnulationFlow {
    sent: EmailQueue[];
    next: EmailQueue | null;
  }
  
  // ✅ NOUVEAUX TYPES POUR WAR ROOM
  export interface WarRoomStudy extends Study {
    risk: "muet" | "agité" | "interesse" | "stable" | "fatigue";
  }
  
  export interface TensionMetrics {
    silent: Study[];
    agitated: Study[];
    interested: Study[];
    fatigued: Study[];
    tensionLevel: number;
    priority: Study | null;
  }

  export interface DashboardFilters {
    search: string;
    views: string | null;
    clicks: string | null;
    status: string | null;
    optout: boolean;
  }
  export interface LeadFilters {
    search: string;
    today: boolean;
    optedOut: boolean;
  }
