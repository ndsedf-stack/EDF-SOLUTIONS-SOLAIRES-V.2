import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("⚠️ Missing Supabase environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Using fallback.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Study {
  id: string;
  study_data: any;
  created_at: string;
  expires_at: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  commercial_name?: string;
  commercial_email: string;
  opened_at?: string;
  opened_count: number;
  last_opened_at?: string;
  reminder_sent: boolean;
  is_active: boolean;
}
