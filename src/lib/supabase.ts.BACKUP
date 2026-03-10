import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("⚠️ Missing Supabase environment variables");
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
